import mongoose from "mongoose";


const reviewSchema = new mongoose.Schema({
    reviewedEntityId : {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Please provide id of food, restaurant or delivery person for which review is being made"],
        refPath: 'review_for_model'
    },
    review_for_model: {
        type: String,
        required: true,
        enum: ['food', 'restaurant', 'deliveryPerson']
    },
    rating: {
        type: Number,
        required: [true, "Please provide a rating"],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, "Please provide a comment"],
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Please provide user ID"],
        ref: 'user'
    }

}, { timestamps: true })

const ReviewModel = mongoose.model("review", reviewSchema)
export default ReviewModel