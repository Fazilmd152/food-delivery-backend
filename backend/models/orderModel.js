import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: {
        type: Number, // MySQL user_id
        required: true
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant',
        required: true
    },
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food',
        required: true
    },
    quantity: Number,
    price: Number,

    totalAmount: {
        type: Number,
        required: true
    },
    deliveryAddress: {
        street: String,
        city: String,
        pincode: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: [
            'placed',
            'accepted',
            'preparing',
            'ready_for_pickup',
            'picked_up',
            'on_the_way',
            'delivered',
            'awaiting_delivery',
            'rejected_by_delivery',
            'cancelled'
        ],
        default: 'placed'
    },
    deliveryAttemptCount: {
        type: Number,
        default: 0
    },
    deliveryRejections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'deliveryPerson'
    }],

    deliveryBoyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'deliveryPerson'
    },
    deliveryTracking: {
        currentLocation: {
            lat: Number,
            lng: Number
        },
        updatedAt: Date
    },
    estimatedDeliveryTime: {
        type: Date
    },
    timestamps: {
        placedAt: {
            type: Date,
            default: Date.now
        },
        deliveredAt: Date,
        cancelledAt: Date
    }
}, { timestamps: true })

export const OrderModel = mongoose.model('Order', orderSchema)

export default OrderModel
