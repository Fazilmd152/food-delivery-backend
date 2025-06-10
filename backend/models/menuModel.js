import mongoose from "mongoose";


const menuSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurant",
        required: [true, "Please provide restaurant ID"]
    },
    description: {
        type: String,
        required: [true, "Please provide a description"]
    },
    type: {
        type: String,
        enum: ["breakfast", "lunch", "dinner", "snacks", "drinks"],
        required: [true, "Please specify the menu type"]
    },
    isAvailable: {
        type: Boolean,
        default: false
    },
    menuItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "food"
    }]
})



const MenuModel = mongoose.model("menu", menuSchema)
export default MenuModel