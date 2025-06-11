import DeliveryModel from "../models/deliveryPersonModel.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import sendCookie from "../utils/jwt.js";
import asyncError from "../utils/asyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import sendEmail from "../utils/sendEmail.js";

const apiFeature = new ApiFeatures()

/**** 
Register delivery person - (/api/deliveryperson/auth/register)
****/
export const registerDeliveryPerson = asyncError(async (req, res, next) => {
    const { name, email, phone, password, vehicleType ,vehicleNumber} = req.body

    // Check if delivery person already exists
    const existingDeliveryPerson = await DeliveryModel.findOne({
        $or: [{ email }, { phone }]
    })
    if (existingDeliveryPerson)
        return next(new ErrorHandler("Delivery person already exists with this email or phone", 400))
    // Create new delivery person
    const deliveryPerson = await DeliveryModel.create({
        name, email, phone, password, vehicleType,vehicleNumber
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
    const deliveryPerson = await DeliveryModel.findById(req.deliveryPerson._id)

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
        deliveryPerson
    })
})

/****
Change delivery person password - (/api/deliveryperson/auth/changepassword) 
****/
export const changeDeliveryPersonPassword = asyncError(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body
    const deliveryPerson = await DeliveryModel.findById(req.deliveryPerson._id).select('+password')

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
Get delivery person profile - (/api/deliveryperson/auth/getme)
****/
export const getDeliveryPersonProfile = asyncError(async (req, res, next) => {  
    const deliveryPerson = await DeliveryModel.findById(req.deliveryPerson._id)

    if (!deliveryPerson)
        return next(new ErrorHandler("Delivery person not found", 404))

    // Exclude sensitive fields
    const { password, otp, otpDetails, status, otpExpiry, ...profile } = deliveryPerson.toObject()

    res.status(200).json({
        success: true,
        message: "Delivery person profile retrieved successfully",
        deliveryPerson: profile
    })
})


/****
 Reset delivery person password - (/api/deliveryperson/auth/resetpassword/:resetToken) 
 ****/
export const resetDeliveryPersonPassword = asyncError(async (req, res, next) => {
    const { token } = req.params
    const { newPassword } = req.body

    // Validate token
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')
    const deliveryPerson = await DeliveryModel.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    if (!deliveryPerson)
        return next(new ErrorHandler("Invalid or expired reset password token", 400))
    // Update password
    deliveryPerson.password = newPassword
    deliveryPerson.resetPasswordToken = undefined
    deliveryPerson.resetPasswordExpire = undefined
    await deliveryPerson.save()
    res.status(200).json({
        success: true,
        message: "Password reset successfully. You can now login with your new password"
    })
})



/****
 forgot password - (/api/deliveryperson/auth/forgotpassword)
****/
export const forgotDeliveryPersonPassword = asyncError(async (req, res, next) => {
    const { email, phone } = req.body

    if (email) req.body.phone = undefined
    if (phone) req.body.email = undefined

    const condition = {}
    if (email) condition.email = email
    else if (phone) condition.phone = phone

    const deliveryPerson = await DeliveryModel.findOne(condition)
    if (!deliveryPerson)
        return next(new ErrorHandler("Delivery person not found with this email or phone", 404))

    const resetToken = deliveryPerson.getResetPasswordToken()
    await deliveryPerson.save()

    // Send reset password link via email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/deliveryperson/auth/resetpassword/${resetToken}`
    const result = await sendEmail({
        email: deliveryPerson.email,
        subject: "Reset Password",
        message: `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl} \n\n If you did not request this, please ignore this email.`
    })

    if (!result)
        return next(new ErrorHandler("Failed to send reset password email. Please try again later", 500))

    res.status(200).json({
        success: true,
        message: "Reset password link sent to your registered email"
    })
})

/****
Get all delivery persons - (/api/deliveryperson/all)
****/
export const getAllDeliveryPersons = asyncError(async (req, res, next) => {
    const apiFeature = new ApiFeatures(DeliveryModel.find(), req.query)
        .search()
        .filter()
        .pagination()

    const deliveryPersons = await apiFeature.query

    res.status(200).json({
        success: true,
        message: "All delivery persons retrieved successfully",
     deliveryPersons
    })
})


/****
Get delivery person by ID - (/api/deliveryperson/get/:id)
****/
export const getDeliveryPersonById = asyncError(async (req, res, next) => {
    const { id } = req.params
    const deliveryPerson = await DeliveryModel.findById(id)
    if (!deliveryPerson)
        return next(new ErrorHandler("Delivery person not found", 404))
    // Exclude sensitive fields
    const { password, otp, otpDetails, status, otpExpiry, ...profile } = deliveryPerson.toObject()
    res.status(200).json({
        success: true,
        message: "Delivery person retrieved successfully",
        deliveryPerson: profile
    })
})

/****
Delete delivery person - (/api/deliveryperson/delete/:id)
****/
export const deleteDeliveryPerson = asyncError(async (req, res, next) => {
    const { id } = req.params
    const deliveryPerson = await DeliveryModel.findByIdAndDelete(id)
    if (!deliveryPerson)
        return next(new ErrorHandler("Delivery person not found", 404))
    res.status(200).json({
        success: true,
        message: "Delivery person deleted successfully"
    })
})

/****
 get delivery person coordinates - (/api/deliveryperson/track/coordinates/:id)
****/
export const getDeliveryPersonCoordinates = asyncError(async (req, res, next) => {
    const { id } = req.params
    const deliveryPerson = await DeliveryModel.findById(id)
    if (!deliveryPerson)
        return next(new ErrorHandler("Delivery person not found", 404))
    if (!deliveryPerson.coordinates || !deliveryPerson.coordinates.latitude || !deliveryPerson.coordinates.longitude)
        return next(new ErrorHandler("Delivery person coordinates not found", 404))
    res.status(200).json({
        success: true,
        message: "Delivery person coordinates retrieved successfully",
        coordinates: deliveryPerson.coordinates
    })  
})


/****
Update delivery person coordinates - (/api/deliveryperson/track/updatecoordinates)
****/
export const updateDeliveryPersonCoordinates = asyncError(async (req, res, next) => {
    const { latitude, longitude } = req.body
    const deliveryPerson = await DeliveryModel.findById(req.deliveryPerson._id)

    if (!deliveryPerson)
        return next(new ErrorHandler("Delivery person not found", 404))

    // Update coordinates
    deliveryPerson.coordinates = {
        latitude,
        longitude
    }
    await deliveryPerson.save()

    res.status(200).json({
        success: true,
        message: "Delivery person coordinates updated successfully",
        coordinates: deliveryPerson.coordinates
    })
})

