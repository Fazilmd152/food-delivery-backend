import RestModel from "../models/restaurantModel.js";
import ReviewModel from "../models/reviewModel.js";
import User from "../models/userModel.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import asyncError from "../utils/asyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import sendCookie from "../utils/jwt.js";
import RestaurantApiFeatures from "../utils/MenuandFoodApiFeatures.js";
import sendEmail from "../utils/sendEmail.js";

const apiFeature = new ApiFeatures()

/****
Register restaurant - (/api/restaurant/auth/register)
****/
export const registerRetaurant = asyncError(async (req, res, next) => {
    const { name, email, password, address, phone, categories } = req.body
    //checking if there's restaurant already with this credential 
    const isExist = await RestModel.findOne({ $or: [{ email }, { phone }] })
    if (isExist)
        next(new ErrorHandler("Restaurant Already Exists with this credentials,please try later"))

    const restaurant = await RestModel.create({ name, email, password, address, phone, categories })
    if (!restaurant)
        next(new ErrorHandler("There's a problem creating restaurant,please try later"))

    sendCookie(res, restaurant, "restaurant")
})


/****
Login restaurant - (/api/restaurant/auth/login)
****/
export const loginViaEmail = asyncError(async (req, res, next) => {
    const { email, password } = req.body

    const restaurant = await RestModel.findOne({ email }).select('+password')
    if (!restaurant)
        return next(new ErrorHandler("Invalid Email or Password", 400))

    const isMatch = await restaurant.isValidPassword(password);
    if (!isMatch)
        return next(new ErrorHandler("Invalid Email or Password", 400))

    sendCookie(res, restaurant, "restaurant")
})


/****
Login restaurant using phone - (/api/restaurant/auth/phone/login)
****/
export const loginViaPhone = asyncError(async (req, res, next) => {
    const { phone, password } = req.body

    const restaurant = await RestModel.findOne({ phone }).select('+password');
    if (!restaurant)
        return next(new ErrorHandler("Invalid Phone number or Password", 400));

    const isMatch = await restaurant.isValidPassword(password);
    if (!isMatch)
        return next(new ErrorHandler("Invalid Email or Password", 400));

    sendCookie(res, restaurant, "restaurant");
})


/****
Login restaurant using OTP - (/api/restaurant/auth/otp/login)
****/
export const loginViaOtp = asyncError(async (req, res, next) => {
    const { email, phone } = req.body;

    if (email) req.body.phone = undefined;
    if (phone) req.body.email = undefined;

    const condition = {};
    if (email) condition.email = email;
    else if (phone) condition.phone = phone;

    const restaurant = await RestModel.findOne(condition);
    if (!restaurant) {
        return next(
            new ErrorHandler(
                email
                    ? "Invalid email address or no restaurant found with this email"
                    : "Invalid phone number or no restaurant found with this phone",
                404
            )
        );
    }

    const emailCopy = restaurant?.email || ""
    const [name, domain] = emailCopy.split('@')
    const masked = name.slice(0, 3)
        + "*".repeat(Math.max(0, name.length - 5))
        + name.slice(-2)
        + "@" + domain;

    const otp = apiFeature.getOtp()
    const expiryTime = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    restaurant.otp = otp;
    restaurant.otpDetails = 'Otp sent via email';
    restaurant.status = false;
    restaurant.otpExpiry = expiryTime;
    await restaurant.save();

    const recipientEmail = email ? email : emailCopy;
    const result = await apiFeature.sendOtp(recipientEmail, otp);
    if (!result)
        return next(new ErrorHandler(`Failed to send OTP. Please retry later`, 400));

    res.status(200).json({
        success: true,
        message: (!email
            ? `OTP sent to your registered email ${masked} with this Number`
            : "OTP sent to your registered email")
    });
})


/****
Verify restaurant OTP - (/api/restaurant/auth/otp/verify)
****/
export const verifyOtp = asyncError(async (req, res, next) => {
    const { otp } = req.body;

    const restaurant = await RestModel.findOne({
        otp,
        status: false,
        otpExpiry: { $gt: new Date() }
    });

    if (!restaurant)
        return next(new ErrorHandler("Otp has been expired, Try again", 404));

    restaurant.status = true;
    restaurant.otp = null;
    restaurant.otpExpiry = null;
    restaurant.otpDetails = null;
    await restaurant.save();

    sendCookie(res, restaurant, "restaurant")
})


/****
Update restaurant - (/api/restaurant/auth/update)
****/
export const updateRestaurant = asyncError(async (req, res, next) => {
    const { name } = req.body;
    const restaurant = await RestModel.findById(req.admin._id);
    if (!restaurant)
        return next(new ErrorHandler("Restaurant not found", 404));

    restaurant.name = name || restaurant.name;
    await restaurant.save();

    const { password, ...updateRestaurant } = restaurant.toObject();

    res.status(200).json({
        success: true,
        message: "Restaurant has been updated",
        updateRestaurant
    });
})


/****
Change restaurant password - (/api/restaurant/auth/changepassword)
****/
export const changePassword = asyncError(async (req, res, next) => {
    const { password, newPassword } = req.body;
    const restaurant = await RestModel.findOne({ email: req.admin.email }).select('+password');

    const isMatch = await restaurant.isValidPassword(password);
    if (!isMatch)
        return next(new ErrorHandler("Invalid old Password", 401));

    restaurant.password = newPassword;
    await restaurant.save();

    res.status(200).json({
        success: true,
        message: "Password has been changed"
    });
})


/****
Logout restaurant - (/api/restaurant/auth/logout)
****/
export const logoutRetaurant = asyncError(async (req, res, next) => {
    res.status(200).cookie("restaurantAuth", null, { maxAge: 0 }).json({
        succes: true,
        message: "Logged out succesfully"
    })
})

/****
Get all restaurants - (/api/restaurant/all) 
****/
export const getAllRestaurants = asyncError(async (req, res, next) => {
    const totalRestaurants = await RestModel.countDocuments()
    const apiFeature = new RestaurantApiFeatures(RestModel.find(), req.query).search().filter()
    const filteredRestaurantsCount = await apiFeature.query.clone().countDocuments()
    apiFeature.paginate()
    const restaurants = await apiFeature.query
    res.status(200).json({
        success: true,
        totalRestaurants,
        count: filteredRestaurantsCount,
        restaurants
    })
})

/****
Get single restaurants - (/api/restaurant/:id) 
****/
export const getRestaurant = asyncError(async (req, res, next) => {
    const restaurant = await RestModel.findById(req.params.id)
    if (!restaurant)
        return next(new ErrorHandler("Restaurant not found", 404))

    res.status(200).json({
        success: true,
        restaurant
    })
})


/****
Get restaurant details - (/api/restaurant/auth/getme)
****/
export const getLoggedRestaurant = asyncError(async (req, res, next) => {
    const { restaurant_id } = req.restaurant

    const restaurant = await RestModel.findById(restaurant_id)
    if (!restaurant)
        return next(new ErrorHandler("Restaurant not found", 404))

    res.status(200).json({
        success: true,
        message: "Restaurant details retrieved successfully",
        restaurant
    })
})

/****
Forgot Password - (/api/restaurant/auth/forgotpassword)
****/
export const restaurantForgotPassword = asyncError(async (req, res, next) => {
    const { email } = req.body
    const restaurant = await RestModel.findOne({ email })
    if (!restaurant)
        return next(new ErrorHandler("Restaurant not found with this email", 404))
    const resetToken = restaurant.getRestPasswordToken()
    await restaurant.save({ validateBeforeSave: false })
    const resetUrl = `${req.protocol}://${req.get("host")}/api/restaurant/auth/resetpassword/${resetToken}`
    const message = `Your password reset link is as follows:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`
    const result = await sendEmail({
        email: restaurant.email,
        subject: "Restaurant Password Recovery",
        message
    })
    if (!result || result.status !== "Success")
        return next(new ErrorHandler("Failed to send reset password email", 500))
    res.status(200).json({
        success: true,
        message: `Reset password link has been sent to ${restaurant.email}`
    })
})


/****
Reset Password - (/api/restaurant/auth/resetpassword/:resetToken)
****/
export const restaurantResetPassword = asyncError(async (req, res, next) => {
    const { newPassword } = req.body
    const resetToken = req.params.resetToken

    const hashedToken = RestModel.getRestPasswordToken(resetToken)
    const restaurant = await RestModel.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!restaurant)
        return next(new ErrorHandler("Reset password token is invalid or has expired", 400))

    restaurant.password = newPassword
    restaurant.resetPasswordToken = undefined
    restaurant.resetPasswordExpire = undefined
    await restaurant.save()

    res.status(200).json({
        success: true,
        message: "Password has been reset successfully"
    })
})


/****
add restaurant review - (/api/restaurant/review/add/:id)
****/
export const addRestaurantReview = asyncError(async (req, res, next) => {
    const { rating, comment } = req.body
    const restaurantId = req.params.id
    const userId = req.restaurant._id
    const restaurant = await RestModel.findById(restaurantId)
    if (!restaurant)
        return next(new ErrorHandler("Restaurant not found", 404))
    const review = await ReviewModel.create({
        reviewedEntityId: restaurantId,
        review_for_model: 'restaurant',
        rating,
        comment,
        userId
    })

    if (!review)
        return next(new ErrorHandler("Failed to add review, please try again later", 500))
    res.status(201).json({
        success: true,
        message: "Review added successfully",
        review
    })
})




