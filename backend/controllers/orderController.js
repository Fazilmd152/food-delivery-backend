import OrderModel from "../models/newOrderModel.js"
import DeliveryPersonModel from "../models/deliveryPersonModel.js"
import asyncError from '../utils/asyncError.js'
import FoodModel from "../models/foodModel.js"
import ErrorHandler from '../utils/ErrorHandler.js'
import NotificationModel from "../models/notificationModel.js"
import agenda from "../agenda/agenda.js"
import { AccessDeniedError } from "sequelize"



// export const createAndAssignOrder = async (req, res, next) => {
//   try {
//     const {
//       userId,
//       restaurant,
//       items,
//       totalAmount,
//       deliveryAddress, // should contain coordinates: { lat, lng }
//       paymentMethod
//     } = req.body;

//     const { lat, lng } = deliveryAddress.coordinates;

//     // 1. Find nearest available delivery person within 5km (adjustable)
//     const nearestDeliveryPerson = await DeliveryPersonModel.findOne({
//       location: {
//         $near: {
//           $geometry: {
//             type: 'Point',
//             coordinates: [lng, lat]
//           },
//           $maxDistance: 5000 // meters
//         }
//       },
//       isAvailable: true // assume you track availability
//     })

//     if (!nearestDeliveryPerson) {
//       return res.status(404).json({ message: "No delivery person available nearby" })
//     }

//     // 2. Estimate delivery time (e.g., 45 minutes from now)
//     const estimatedDeliveryTime = new Date(Date.now() + 45 * 60 * 1000)

//     // 3. Create the order
//     const order = await OrderModel.create({
//       userId,
//       restaurant,
//       items,
//       totalAmount,
//       deliveryAddress,
//       paymentMethod,
//       estimatedDeliveryTime,
//       deliveryBoyId: nearestDeliveryPerson.userId, // assuming MySQL user ID
//       orderStatus: 'accepted' // can set to placed or accepted directly
//     })

//     // 4. Mark delivery person as unavailable
//     nearestDeliveryPerson.isAvailable = false
//     await nearestDeliveryPerson.save()

//     return res.status(201).json({
//       success: true,
//       message: "Order created and delivery person assigned",
//       order
//     })

//   } catch (error) {
//     next(error)
//   }
// };

/**** 
create order - (/api/order/placeorder/:restaurantId)
****/
export const createOrder = asyncError(async (req, res, next) => {
    const userId = req.user.id
    const { restaurantId } = req.params
    const {
        items,
        totalAmount,
        deliveryAddress,
        restaurantLocation,
    } = req.body


    let preparationTime = 0
    //checking all the foods are avialible
    for (const item of items) {
        const food = await FoodModel.findById(item.foodId)
        if (!food) return next(new ErrorHandler(`Food not found with this id ${item.foodId}`, 401));
        preparationTime += food.preparationTime
    }

    const travelTime = 15 // Placeholder for now should be calculated via map API


    const estimatedDeliveryTime = new Date(Date.now() + (preparationTime + travelTime) * 60 * 1000)

    const order = await OrderModel.create({
        userId,
        restaurantId,
        items,
        totalAmount,
        deliveryAddress,
        restaurantLocation,
        estimatedDeliveryTime
    })

    if (!order)
        return next(new ErrorHandler("Order creation failed", 401));

    // Notify restaurant immediately -yet to add push notification
    await NotificationModel.create({
        restaurantId,
        message: "Order assigned",
    })
    //socket code 
    socket.to(`restaurantId${restaurantId}`).emit('newOrder', order)
    // Schedule a job to trigger when preparation time ends
    const notifyTime = new Date(Date.now() + preparationTime * 60 * 1000)

    await agenda.schedule(notifyTime, 'notifyPreparationTimeOver', {
        orderId: order._id.toString(),
        restaurantId,
    })

    // Schedule delivery boy assignment just before order is ready (7 mins before)
    // const assignTime = new Date(Date.now() + (preparationTime - 2) * 60 * 1000);
    // await agenda.schedule(assignTime, 'assignDeliveryBoy', {
    //     orderId: order._id.toString(),
    //     coordinates: deliveryAddress.coordinates, // { lat, lng }
    // })

    res.status(201).json({
        success: true,
        message: "Order created",
        order,
    })
})

/****
update order by restaurant - (/api/order/updatebyrestaurant/:orderId)
****/
export const rejectOrder = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params
    const deliveryBoyId = req.user.id // Authenticated delivery boy

    const order = await OrderModel.findById(orderId);
    if (!order) return next(new ErrorHandler("Order not found", 404));

    order.deliveryRejections.push(deliveryBoyId);
    order.orderStatus = 'rejected_by_delivery';
    await order.save()

    await agenda.now('assignDeliveryBoy', { orderId })

    res.status(200).json({ success: true, message: "Order rejected and reassigning..." })
})


export const updateOrderByRestaurant = asyncError(async (req, res, next) => {
    const { orderId } = req.params;
    const { status, extendedTime } = req.body // extendedTime in minutes

    const order = await OrderModel.findById(orderId)
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' })
    }

    // Update status if provided
    if (status) {
        order.status = status
    }

    // Update estimated delivery time if extendedTime is provided
    if (extendedTime) {
        const currentEstimate = new Date(order.estimatedDeliveryTime || Date.now())
        const extendedEstimate = new Date(currentEstimate.getTime() + extendedTime * 60000)
        order.estimatedDeliveryTime = extendedEstimate
    }

    await order.save()

    // Broadcast the updated order to user and restaurant rooms
    socket.to(`userId${order.userId}`).emit('updatedOrder', order)
    socket.to(`restaurantId${order.restaurantId}`).emit('updatedOrder', order)

    // If the order is ready, schedule assignment
    if (status === 'ready') {
        await agenda.schedule(new Date(), 'assignDeliveryBoy', {
            orderId: order._id.toString(),
            coordinates: order.deliveryAddress.coordinates, // should exist
        })
    }
    res.status(200).json({ success: true, order })
})


export const updateOrderByDeliveryPerson = asyncError(async (req, res, next) => {
    // 'picked_up',
    // 'on_the_way',
    // 'delivered'
    // 'awaiting_delivery',
    // 'rejected_by_delivery',
    const orderId = req.params
    const { orderStatus } = req.body
    await OrderModel.findByIdAndUpdate(orderId, { orderStatus })
})


export const updateDeliveryPersonTracking = asyncError(async (req, res, next) => {
    const { latitude, longitude } = req.body
    const orderId = req.params
    await OrderModel.findByIdAndUpdate(orderId, { deliveryTracking: { currentLocation: { latitude, longitude } } })
})


