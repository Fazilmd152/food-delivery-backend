import { Agenda } from 'agenda'
import OrderModel from '../models/orderModel.js'
import DeliveryPersonModel from '../models/deliveryPersonModel.js'


const agenda = new Agenda({ db: { address: process.env.MONGO_URI, collection: 'agendaJobs' } })

// Define job to assign delivery boy
agenda.define('assignDeliveryBoy', async (job) => {
  const { orderId } = job.attrs.data;
  const order = await OrderModel.findById(orderId)

  if (!order || order.orderStatus === 'accepted') return;

  // Prevent reassigning same delivery person
  const excludeIds = order.deliveryRejections.map(id => id.toString());

  const { lng, lat } = order.deliveryAddress.coordinates;

  const nextDeliveryBoy = await DeliveryPersonModel.findOne({
    _id: { $nin: excludeIds },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: 5000
      }
    },
    isAvailable: true
  })

  if (!nextDeliveryBoy) {
    console.log(`❌ No delivery boy available for retry of order ${orderId}`)
    return
  }

  // Update order
  order.deliveryBoyId = nextDeliveryBoy.userId
  order.orderStatus = 'awaiting_delivery'
  order.deliveryAttemptCount += 1
  await order.save()

  // Notify delivery boy via socket/notification (pseudo-code)
  // notifyDeliveryBoy(nextDeliveryBoy.userId, order._id);

  // Set timer for response (e.g., 30s), schedule fallback if no response
  await agenda.schedule(new Date(Date.now() + 30000), 'checkDeliveryAcceptance', {
    orderId: order._id.toString(),
    deliveryBoyId: nextDeliveryBoy.userId
  })

  console.log(`🕒 Delivery person ${nextDeliveryBoy.userId} assigned to order ${order._id}, awaiting acceptance`);
})


agenda.define('checkDeliveryAcceptance', async (job) => {
  const { orderId, deliveryBoyId } = job.attrs.data;
  const order = await OrderModel.findById(orderId);

  if (!order || order.orderStatus === 'accepted') return;

  // Delivery not accepted
  order.deliveryRejections.push(deliveryBoyId);
  order.orderStatus = 'rejected_by_delivery';
  await order.save();

  console.log(`❌ Delivery person ${deliveryBoyId} rejected order ${orderId}`);

  // Retry if attempts < 5
  if (order.deliveryAttemptCount < 5) {
    await agenda.now('assignDeliveryBoy', { orderId });
  } else {
    console.log(`🚫 Max delivery assignment attempts reached for order ${orderId}`);
  }
})


(async function () {
  await agenda.start()
})()

export default agenda
