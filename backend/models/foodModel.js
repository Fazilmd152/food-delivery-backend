import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurant",
        required: [true, "Please provide restaurant ID"]
    },
    name: {
        type: String,
        required: [true, "Please provide food name"]
    },
    description: {
        type: String,
        required: [true, "Please provide a description"]
    },
    price: {
        type: Number,
        required: [true, "Please provide a price"]
    },
    categories: {
        type: [String],   // e.g. "Main Course", "Dessert", etc.
        required: [true, "Please provide a category"]
    },
    image_url: {
        type: [String],
        required: [true, "Please provide an image URL"]
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    tags: {
        type: [String], // Optional tags like ["Spicy", "Vegan", "Popular"]
        default: []
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    preparationTime: {
        type: Number, // in minutes
        default: 15
    },
    ingredients: {
        type: [String], // e.g., ["Cheese", "Tomato", "Basil"]
        default: []
    }
}, { timestamps: true })

const FoodModel = mongoose.model("food", foodSchema)

export default FoodModel