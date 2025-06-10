import mongoose from "mongoose"
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const addressSchema = new mongoose.Schema({
    address: {
        type: String,
        required: [true, "Please provide address"]
    },
    pinCode: {
        type: String,
        required: [true, "Please provide pin code"]
    },
    city: {
        type: String,
        required: [true, "Please provide city"]
    },
    state: {
        type: String,
        required: [true, "Please provide state"]
    },
    country: {
        type: String,
        required: [true, "Please provide country"]
    }
})

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [, "Please enter a name"],
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
        required: [true, "Please enter a password"],
        maxLength: [15, "password cannot exceed 15 character"],
        select: false
    },
    image_url: {
        profile_img: {
            type: String,
        },
        cover_img: {
            type: String,
        },
        other_images_urls: [
            {
                type: String,
            }
        ]
    },
    address: addressSchema,
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: "2dsphere",
        },
    },
    phone: {
        type: String,
    },
    is_open: {
        type: Boolean,
        default: true,
    },
    opening_time: {
        type: String,
        default: "08:00 AM",
    },
    closing_time: {
        type: String,
        default: "10:00 PM",
    },
    average_rating: {
        type: Number,
        default: 0,
    },
    total_reviews: {
        type: Number,
        default: 0,
    },
    categories: {
        type: [{
            type: String,
            enum: [
                "tamil nadu cuisine",
                "chettinad cuisine",
                "south indian",
                "north indian",
                "kerala meals",
                "andhra meals",
                "punjabi cuisine",
                "bengali cuisine",
                "gujarati cuisine",
                "indian",
                "chinese",
                "italian",
                "mexican",
                "fast food",
                "street food",
                "tiffin items",
                "dosa varieties",
                "idli varieties",
                "parotta specials",
                "kothu parotta",
                "biryani specials",
                "ambur biryani",
                "dindigul biryani",
                "madurai style",
                "sambar & chutney",
                "halwa specials",
                "sweets & desserts",
                "filter coffee",
                "tea kadai snacks",
                "shawarma",
                "sandwich & rolls",
                "bakery",
                "cafe",
                "jigarthanda",
                "juice & beverages",
                "beverages",
                "falooda",
                "kulfi / ice cream",
                "seafood",
                "fish fry",
                "chicken specials",
                "mutton curry",
                "barbecue",
                "vegan",
                "vegetarian",
                "non-vegetarian",
                "healthy",
                "organic",
                "gluten-free",
                "middle eastern",
                "thai",
                "continental",
                "japanese",
                "korean",
                "mediterranean",
                "fusion",
                "american",
                "french",
                "spanish"
            ], // Each item is validated
        }],
        required: [true, "Please provide at least one valid category"]
    },
    role: {
        type: String,
        default: 'restaurant'
    },
    isActive: {
        type: Boolean,
        required: true,
        default: false
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
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true })


//hashing password
restaurantSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 11)
})

//validate password
restaurantSchema.methods.isValidPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

//get jwt token
restaurantSchema.methods.getJwtToken = async function () {
    return jwt.sign(
        { id: this._id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_TIME }
    )
}

//get reset password token
restaurantSchema.methods.getRestPasswordToken = function () {
    const token =crypto.randomBytes(20).toString('hex')
    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')
    this.resetPasswordExpire=Date.now()+ 30 * 60 * 1000 // 30 minutes
    return token
}


const RestModel = mongoose.model('restaurant', restaurantSchema)

export default RestModel