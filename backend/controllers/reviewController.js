import ReviewModel from "../models/reviewModel.js"
import User from "../models/userModel.js"
import asyncError from "../middlewares/asyncError.js"
import ErrorHandler from "../utils/ErrorHandler.js"


/****
Get all reviews  -
(/api/restaurant/review/all/:id?model=restaurant)
(/api/restaurant/menu/food/review/all/:id?model=food)
(/api/deliveryPerson/review/all/:id?model=deliveryPerson)
****/
export const getAllReviews = asyncError(async (req, res, next) => {
    const entityId = req.params.id
    const modelType = req.query.model // 'restaurant' | 'food' | 'deliveryPerson'

    // Validate model type
    if (!['restaurant', 'food', 'deliveryPerson'].includes(modelType))
        return next(new ErrorHandler("Invalid model type. Use 'restaurant', 'food', or 'deliveryPerson'.", 400))


    // 1. Get reviews from MongoDB
    const reviews = await ReviewModel.find({
        reviewedEntityId: entityId,
        review_for_model: modelType
    })

    if (!reviews || reviews.length === 0)
        return next(new ErrorHandler("No reviews found for this restaurant", 404))

    // 2. Extract unique user IDs
    const userIds = [...new Set(reviews.map(review => review.userId.toString()))]

    // 3. Fetch users from MySQL
    const users = await User.findAll({
        where: { id: userIds },
        attributes: ['id', 'name', 'email']
    })

    // 4. Map user ID to user object for faster lookup
    const userMap = {}
    users.forEach(user => {
        userMap[user.id.toString()] = user
    })

    // 5. Attach user info to each review
    const reviewsWithUserDetails = reviews.map(review => {
        const user = userMap[review.userId.toString()]
        return {
            ...review.toObject(),
            user: user ? {
                id: user.id,
                name: user.name,
                email: user.email
            } : null
        }
    })

    // 6. Send response
    res.status(200).json({
        success: true,
        count: reviewsWithUserDetails.length,
        reviews: reviewsWithUserDetails
    })
})

/****
create review -
 (/api/restaurant/review/add?model=restaurant)
 (/api/food/review/add?model=food)
 (/api/deliveryPerson/review/add?model=deliveryPerson)
****/
export const addReview = asyncError(async (req, res, next) => {
    const { rating, comment } = req.body
    const userId = req.user.id
    const entityId = req.body.entityId // ID of the entity being reviewed
    const modelType = req.query.model // 'restaurant' | 'food' | 'deliveryPerson'

    // Validate input
    if (!rating || !comment || !entityId)
        return next(new ErrorHandler("Rating, comment, and entity ID are required", 400))

    // Validate model type
    if (!['restaurant', 'food', 'deliveryPerson'].includes(modelType))
        return next(new ErrorHandler("Invalid model type. Use 'restaurant', 'food', or 'deliveryPerson'.", 400))

    // Create review
    const review = await ReviewModel.create({
        reviewedEntityId: entityId,
        review_for_model: modelType,
        rating,
        comment,
        userId: userId
    })
    if (!review)
        return next(new ErrorHandler("Failed to create review", 500))
    // Fetch user details
    const user = await User.findByPk(userId)
    if (!user)
        return next(new ErrorHandler("User not found", 404))
    // Attach user details to review
    const reviewWithUserDetails = {
        ...review.toObject(),
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    }
    res.status(201).json({
        success: true,
        message: "Review created successfully",
        review: reviewWithUserDetails
    })
})


/****
get reviews by user - (/api/review/user/:id)
****/
export const getReviewsByUser = asyncError(async (req, res, next) => {
    const userId = req.params.id

    // Validate user ID
    if (!userId)
        return next(new ErrorHandler("User ID is required", 400))

    // Fetch reviews by user ID
    const reviews = await ReviewModel.find({ userId: userId })

    if (!reviews || reviews.length === 0)
        return next(new ErrorHandler("No reviews found for this user", 404))

    res.status(200).json({
        success: true,
        count: reviews.length,
        reviews: reviews
    })
})

/****
get review by id - (/api/review/:id)
****/
export const getReviewById = asyncError(async (req, res, next) => {
    const reviewId = req.params.id

    // Validate review ID
    if (!reviewId)
        return next(new ErrorHandler("Review ID is required", 400))

    // Fetch review by ID
    const review = await ReviewModel.findById(reviewId)
    if (!review)
        return next(new ErrorHandler("Review not found", 404))
    // Fetch user details
    const user = await User.findByPk(review.userId)
    if (!user)
        return next(new ErrorHandler("User not found for this review", 404))
    // Attach user details to review
    const reviewWithUserDetails = {
        ...review.toObject(),
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    }
    res.status(200).json({
        success: true,
        review: reviewWithUserDetails
    })
})


/****
update review - (/api/review/update/:id)
****/
export const updateReview = asyncError(async (req, res, next) => {
    const reviewId = req.params.id
    const { rating, comment } = req.body
    const userId = req.user.id

    // Validate input
    if (!rating || !comment)
        return next(new ErrorHandler("Rating and comment are required", 400))

    // Find and update the review
    const review = await ReviewModel.findOneAndUpdate(
        { _id: reviewId, userId: userId },
        { rating, comment },
        { new: true, runValidators: true }
    )

    if (!review)
        return next(new ErrorHandler("Review not found or you are not authorized to update this review", 404))

    res.status(200).json({
        success: true,
        message: "Review updated successfully",
        review: review
    })
})



/****
Delete restaurant review - (/api/restaurant/review/delete/:id)
****/
export const deleteReview = asyncError(async (req, res, next) => {
    const reviewId = req.params.id
    const userId = req.user.id

    const review = ReviewModel.findOneAndDelete({
        _id: reviewId,
        userId: userId,
    })

    if (!review)
        return next(new ErrorHandler("Review not found or you are not authorized to delete this review", 404))

    res.status(200).json({
        success: true,
        message: "Review deleted successfully"
    })
})