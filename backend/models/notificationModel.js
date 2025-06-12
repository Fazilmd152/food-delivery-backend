import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  userId: {
    type: Number,
  },
  deliveryPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "deliveryPerson",
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
  },
  message: String,
  type: {
    type: String, // e.g., "ORDER_PLACED", "ORDER_ASSIGNED", "ORDER_DELIVERED"
  },
  seen: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
})

export const NotificationModel = mongoose.model("notification", notificationSchema);



// const notificationSchema = new mongoose.Schema({
//   notificationerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true
//   },
//   title: {
//     type: String,
//     required: true
//   },
//   message: {
//     type: String,
//     required: true
//   },
//   type: {
//     type: String,
//     enum: ["Order", "Delivery", "Promotional", "System"],
//     default: "System"
//   },
//   isRead: {
//     type: Boolean,
//     default: false
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// })

//module.exports = mongoose.model("Notification", notificationSchema);
