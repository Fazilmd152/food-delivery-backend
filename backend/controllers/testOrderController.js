// controllers/orderController.js
import OrderModel from '../models/orderModel.js'
import DeliveryPerson from '../models/deliveryPersonModel.js'
import { io } from '../socket.js'

// ========== 1. PLACE ORDER =============
export const placeOrder = async (req, res) => {
  const {
    items,
    restaurant,
    userId,
    deliveryAddress,
    totalAmount,
    restaurantLocation
  } = req.body

  const order = await OrderModel.create({
    userId,
    restaurant,
    items,
    deliveryAddress,
    totalAmount,
    restaurantLocation,
    status: 'initiated'
  })

  io.to(`restaurant_${restaurant}`).emit('new_order', order)

  res.status(201).json({ success: true, order })
}

// ========== 2. UPDATE ORDER STATUS =============
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params
  const { status } = req.body

  const order = await OrderModel.findByIdAndUpdate(orderId, { status }, { new: true })

  io.to(`user_${order.userId}`).emit('order_update', { orderId, status })

  if (status === 'ready') assignDelivery(order)

  res.status(200).json({ success: true, order })
}

// ========== 3. SUGGEST NEARBY ORDERS =============
const suggestNearbyOrders = async (agentId, targetLocation) => {
  const nearbyOrders = await OrderModel.find({
    status: 'ready',
    deliveryPerson: null,
    restaurantLocation: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: targetLocation.coordinates
        },
        $maxDistance: 1000
      }
    }
  })

  if (nearbyOrders.length > 0) {
    io.to(`delivery_${agentId}`).emit('suggested_orders', {
      orders: nearbyOrders.map(order => ({
        id: order._id,
        restaurant: order.restaurant,
        address: order.deliveryAddress,
        total: order.totalAmount
      }))
    })
  }
}

// ========== 4. ASSIGN DELIVERY =============
const assignDelivery = async (order, triedAgents = []) => {
  const agents = await DeliveryPerson.find({
    isAvailable: true,
    _id: { $nin: triedAgents },
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: order.restaurantLocation.coordinates
        },
        $maxDistance: 5000
      }
    }
  })

  if (!agents.length) {
    io.to(`restaurant_${order.restaurant}`).emit('no_agent_found', order._id)
    return
  }

  const agent = agents[0]
  triedAgents.push(agent._id)

  io.to(`delivery_${agent._id}`).emit('delivery_request', {
    orderId: order._id,
    pickup: order.restaurantLocation,
    drop: order.deliveryAddress
  })

  setTimeout(async () => {
    const fresh = await OrderModel.findById(order._id)
    if (!fresh.deliveryPerson && fresh.status === 'ready') {
      assignDelivery(fresh, triedAgents)
    }
  }, 30 * 1000)
}

// ========== 5. ACCEPT ORDER =============
export const acceptOrder = async (req, res) => {
  const { orderId, agentId } = req.body

  const order = await OrderModel.findById(orderId)
  if (!order || order.deliveryPerson) {
    return res.status(400).json({ message: 'Order already accepted or not found' })
  }

  order.deliveryPerson = agentId
  order.status = 'picked-up'
  order.acceptedAt = new Date()
  await order.save()

  await DeliveryPerson.findByIdAndUpdate(agentId, {
    isAvailable: false,
    $push: { assignedOrders: orderId }
  })

  io.to(`user_${order.userId}`).emit('order_update', { orderId, status: 'picked-up' })

  await suggestNearbyOrders(agentId, order.restaurantLocation)

  res.status(200).json({ success: true, message: 'Order accepted', order })
}

// ========== 6. UPDATE LIVE LOCATION =============
export const updateLocation = async (req, res) => {
  const { orderId } = req.params
  const { lat, lng } = req.body

  const order = await OrderModel.findByIdAndUpdate(orderId, {
    liveLocation: [lng, lat]
  }, { new: true })

  io.to(`user_${order.userId}`).emit('location_update', { lat, lng })

  res.status(200).json({ success: true })
}

// ========== 7. MARK ORDER DELIVERED =============
export const markDelivered = async (req, res) => {
  const { orderId } = req.params

  const order = await OrderModel.findByIdAndUpdate(orderId, {
    status: 'delivered',
    deliveredAt: new Date()
  }, { new: true })

  if (order.deliveryPerson) {
    await DeliveryPerson.findByIdAndUpdate(order.deliveryPerson, {
      isAvailable: true,
      $pull: { assignedOrders: orderId }
    })
  }

  io.to(`user_${order.userId}`).emit('order_update', { orderId, status: 'delivered' })

  res.status(200).json({ success: true, message: 'Order delivered', order })
}