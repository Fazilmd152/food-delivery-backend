import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  userId: {
    type: Number, // From MySQL – Sequelize auto-increment ID
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'restaurant',
    required: true
  },
  items: [
    {
      foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      notes: String
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    address: { type: String, required: true },
    pinCode: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  restaurantLocation: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  deliveryPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'deliveryPerson',
    default: null
  },
  liveLocation: {
    type: [Number], // [longitude, latitude]
    default: [0, 0]
  },
  estimatedDeliveryTime: {
    type: Date
  },
  status: {
    type: String,
    enum: [
      'initiated',
      'preparing',
      'ready',
      'awaiting-delivery',
      'picked-up',
      'on-the-way',
      'delivered',
      'cancelled'
    ],
    default: 'initiated'
  },
  acceptedAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date
}, {
  timestamps: true
})

// Enable geo indexing for delivery address and restaurant
orderSchema.index({ 'deliveryAddress.coordinates': '2dsphere' })
orderSchema.index({ 'restaurantLocation.coordinates': '2dsphere' })

const OrderModel = mongoose.model('order', orderSchema)
export default OrderModel
