import OrderModel from "../models/orderModel.js"
import DeliveryPersonModel from "../models/deliveryPersonModel.js"
import asyncError from '../utils/asyncError.js'
import FoodModel from "../models/foodModel.js"
import ErrorHandler from '../utils/ErrorHandler.js'
import NotificationModel from "../models/notificationModel.js"
import agenda from "../agenda/agenda.js"



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


export const createOrder = asyncError(async (req, res, next) => {
    const userId = req.user.id
    const { restaurantId } = req.params
    const {
        foodId,
        quantity,
        price,
        totalAmount,
        deliveryAddress,
        paymentMethod,
        paymentStatus,
        orderStatus,
    } = req.body

    const food = await FoodModel.findById(foodId);
    if (!food)
        return next(new ErrorHandler("Food not found", 401));

    const travelTime = 15; // Placeholder for now; should be calculated via map API
    const preparationTime = food.preparationTime;

    const estimatedDeliveryTime = new Date(Date.now() + (preparationTime + travelTime) * 60 * 1000);

    const order = await OrderModel.create({
        userId,
        restaurantId,
        foodId,
        quantity,
        price,
        totalAmount,
        deliveryAddress,
        paymentMethod,
        paymentStatus,
        orderStatus,
        estimatedDeliveryTime,
    })

    if (!order)
        return next(new ErrorHandler("Order creation failed", 401));

    // Notify restaurant immediately
    await NotificationModel.create({
        restaurantId,
        message: "Order assigned",
    })

    // Schedule a job to trigger when preparation time ends
    const notifyTime = new Date(Date.now() + preparationTime * 60 * 1000)

    await agenda.schedule(notifyTime, 'notifyPreparationTimeOver', {
        orderId: order._id.toString(),
        restaurantId,
    });

    // Schedule delivery boy assignment just before order is ready (7 mins before)
    const assignTime = new Date(Date.now() + (preparationTime - 7) * 60 * 1000);
    await agenda.schedule(assignTime, 'assignDeliveryBoy', {
        orderId: order._id.toString(),
        coordinates: deliveryAddress.coordinates, // { lat, lng }
    })

    res.status(201).json({
        success: true,
        message: "Order created",
        order,
    })
})



export const rejectOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const deliveryBoyId = req.user.id; // Authenticated delivery boy

  const order = await OrderModel.findById(orderId);
  if (!order) return next(new ErrorHandler("Order not found", 404));

  order.deliveryRejections.push(deliveryBoyId);
  order.orderStatus = 'rejected_by_delivery';
  await order.save();

  await agenda.now('assignDeliveryBoy', { orderId });

  res.status(200).json({ success: true, message: "Order rejected and reassigning..." });
})

export const updateOrder=asyncError(async (req,res,next)=>{
  
})
