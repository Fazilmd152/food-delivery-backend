import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import validator from 'validator'

const deliveryPersonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter delivery person name'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Please enter phone number'],
        unique: true,
        match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    email: {
        type: String,
        required: [true, "Please enter a mail"],
        validate: [validator.isEmail, "Please enter a valid email"],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Please enter password'],
        minlength: 6,
        select: false, // exclude from query results by default
    },
    profilePhoto: {
        type: String, // URL or file path
        default: '',  // optional
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0],
        },
    },
    assignedOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order',
    }],
    vehicleType: {
        type: String,
        enum: ['bike', 'car', 'scooter', 'bicycle'],
        required: true,
    },
    role: {
        type: String,
        defaultValue: "delivery_person"
    },
    otp: {
        type: String,
        default: null
    },
    otpDetails: {
        type: String,
        default: null
    },
    status: {
        type: Boolean,
        required: true,
        default: false // e.g., inactive until verified
    },
    otpExpiry: {
        type: Date,
        default: null
    }
}, { timestamps: true })

// Enable 2dsphere index for location-based queries
deliveryPersonSchema.index({ location: '2dsphere' })

//hash password before saving
deliveryPersonSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 11)
})

//validate password
deliveryPersonSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//generate JWT token
deliveryPersonSchema.methods.getJwtToken = async function () {
    return jwt.sign(
        { id: this._id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_TIME }
    )
}

const DeliveryPerson = mongoose.model('deliveryPerson', deliveryPersonSchema)

export default DeliveryPerson
