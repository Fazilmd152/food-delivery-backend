import DeliveryModel from "../models/deliveryPersonModel.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import sendCookie from "../utils/jwt.js";
import asyncError from "../utils/asyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";

const apiFeature = new ApiFeatures()

/**** 
Register delivery person - (/api/deliveryperson/auth/register)
****/
export const registerDeliveryPerson = asyncError(async (req, res, next) => {
    const { name, email, phone, password, vehicleType } = req.body;

    // Check if delivery person already exists
    const existingDeliveryPerson = await DeliveryModel.findOne({
        $or: [{ email }, { phone }]
    })
    if (existingDeliveryPerson)
        return next(new ErrorHandler("Delivery person already exists with this email or phone", 400))
    // Create new delivery person
    const deliveryPerson = await DeliveryModel.create({
        name, email, phone, password, vehicleType
    })
    if (!deliveryPerson)
        return next(new ErrorHandler("Failed to create delivery person", 500))
    // Send cookie with delivery person details
    sendCookie(res, deliveryPerson)
})


/****
 * Login delivery person - (/api/deliveryperson/auth/email/login)
 ****/
export const loginViaEmail = asyncError(async (req, res, next) => {
    const { email, password } = req.body
    // Find delivery person by email
    const deliveryPerson = await DeliveryModel.findOne({ email }).select('+password')
    if (!deliveryPerson)
        return next(new ErrorHandler("Invalid Email or Password", 400))
    // Check password match
    const isMatch = await deliveryPerson.isValidPassword(password)
    if (!isMatch)
        return next(new ErrorHandler("Invalid Email or Password", 400))
    // Send cookie with delivery person details
    sendCookie(res, deliveryPerson)
})

/****
 * Login delivery person using phone - (/api/deliveryperson/auth/phone/login)
 ****/
export const loginViaPhone = asyncError(async (req, res, next) => {
    const { phone, password } = req.body
    // Find delivery person by phone
    const deliveryPerson = await DeliveryModel.findOne({ phone }).select('+password')
    if (!deliveryPerson)
        return next(new ErrorHandler("Invalid Phone number or Password", 400))
    // Check password match
    const isMatch = await deliveryPerson.isValidPassword(password)
    if (!isMatch)
        return next(new ErrorHandler("Invalid Phone number or Password", 400))
    // Send cookie with delivery person details
    sendCookie(res, deliveryPerson)
})

/****
 * Login delivery person using OTP - (/api/deliveryperson/auth/otp/login)
 ****/
export const loginViaOtp = asyncError(async (req, res, next) => {
    const { email, phone } = req.body

    if (email) req.body.phone = undefined
    if (phone) req.body.email = undefined

    const condition = {}
    if (email) condition.email = email
    else if (phone) condition.phone = phone

    const deliveryPerson = await DeliveryModel.findOne(condition)
    if (!deliveryPerson) {
        return next(
            new ErrorHandler(
                email
                    ? "Invalid email address or no delivery person found with this email"
                    : "Invalid phone number or no delivery person found with this phone number",
                400))
    }

    const emailCopy = deliveryPerson?.email || ""
    const [name, domain] = emailCopy.split('@')
    const masked = name.slice(0, 3)
        + "*".repeat(Math.max(0, name.length - 5))
        + name.slice(-2)
        + "@" + domain;

    const otp = apiFeature.getOtp()
    const expiryTime = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Save OTP and expiry time to delivery person
    deliveryPerson.otp = otp
    deliveryPerson.otpDetails = 'Otp sent via email'
    deliveryPerson.status = false
    deliveryPerson.otpExpiry = expiryTime
    await deliveryPerson.save()

    const recipientEmail = email ? email : emailCopy
    const result = await apiFeature.sendOtp(recipientEmail, otp)
    if (!result)
        return next(new ErrorHandler(`Failed to send OTP. Please retry later`, 400))

    res.status(200).json({
        success: true,
        message: (!email
            ? `OTP sent to your registered email ${masked} with this Number`
            : "OTP sent to your registered email")
    })
})


/****
 * Verify OTP for delivery person - (/api/deliveryperson/auth/otp/verify)
 ****/
export const verifyOtp = asyncError(async (req, res, next) => {
    const { otp } = req.body

    const deliveryPersosn = await DeliveryModel.findOne({
        otp,
        status: false,
        otpExpiry: { $gt: new Date() }
    });

    if (!deliveryPersosn)
        return next(new ErrorHandler("Otp has been expired, Try again", 404));

    deliveryPersosn.status = true;
    deliveryPersosn.otp = null;
    deliveryPersosn.otpExpiry = null;
    restaurant.otpDetails = null;
    await deliveryPersosn.save();

    sendCookie(res, deliveryPersosn)
})


/****
Update delivery person profile - (/api/deliveryperson/profile/update)
****/
export const updateDeliveryPersonProfile = asyncError(async (req, res, next) => {
    const { name, phone, vehicleType, isAvailable } = req.body
    const deliveryPerson = await DeliveryModel.findById(req.delivery_person._id)

    if (!deliveryPerson)
        return next(new ErrorHandler("Delivery person not found", 404))

    // Update delivery person details
    deliveryPerson.name = name || deliveryPerson.name
    deliveryPerson.phone = phone || deliveryPerson.phone
    deliveryPerson.vehicleType = vehicleType || deliveryPerson.vehicleType
    deliveryPerson.isAvailable = isAvailable !== undefined ? isAvailable : deliveryPerson.isAvailable

    await deliveryPerson.save()

    res.status(200).json({
        success: true,
        message: "Delivery person profile updated successfully",
        delivery_person: deliveryPerson
    })
})

/****
Change delivery person password - (/api/deliveryperson/auth/changepassword) 
****/
export const changeDeliveryPersonPassword = asyncError(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body
    const deliveryPerson = await DeliveryModel.findById(req.delivery_person._id).select('+password')

    if (!deliveryPerson)
        return next(new ErrorHandler("Delivery person not found", 404))

    // Check old password match
    const isMatch = await deliveryPerson.isValidPassword(oldPassword)
    if (!isMatch)
        return next(new ErrorHandler("Old password is incorrect", 400))

    // Update password
    deliveryPerson.password = newPassword
    await deliveryPerson.save()

    res.status(200).json({
        success: true,
        message: "Password changed successfully"
    })
})


/****
Get delivery person profile - (/api/deliveryperson/profile)
****/
export const getDeliveryPersonProfile = asyncError(async (req, res, next) => {  
    const deliveryPerson = await DeliveryModel.findById(req.delivery_person._id)

    if (!deliveryPerson)
        return next(new ErrorHandler("Delivery person not found", 404))

    // Exclude sensitive fields
    const { password, otp, otpDetails, status, otpExpiry, ...profile } = deliveryPerson.toObject()

    res.status(200).json({
        success: true,
        message: "Delivery person profile retrieved successfully",
        delivery_person: profile
    })
})