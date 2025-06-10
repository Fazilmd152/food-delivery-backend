import { Op } from "sequelize"
import ApiFeatures from "../utils/ApiFeatures.js"
import asyncError from "../utils/asyncError.js"
import ErrorHandler from "../utils/ErrorHandler.js"
import sendCookie from "../utils/jwt.js"
import User from "../models/userModel.js"  //mysql sequelize model
import UserApiFeatures from "../utils/UserApiFeatures.js"
import sendEmail from "../utils/sendEmail.js"

const apiFeature = new ApiFeatures()

/**** 
Register a new user - (/api/user/auth/register)
****/
export const register = asyncError(async (req, res, next) => {
    const { name, email, password, phone } = req.body

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser)
        return next(new ErrorHandler("Admin with this email already exists", 400))

    const user = await User.create({ name, email, password, phone })
    if (!user)
        return next(new ErrorHandler("registraion failed", 404))

    sendCookie(res, user, "user")
})



/**** 
Login via Email and Password - (/api/user/auth/login)
****/
export const loginViaMail = asyncError(async (req, res, next) => {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user)
        return next(new ErrorHandler("Invalid Email or Password", 400))

    const isMatch = await user.isValidPassword(password)
    if (!isMatch)
        return next(new ErrorHandler("Invalid Email or Password", 400))

    sendCookie(res, user, "user") //send cookie
})


/**** 
Login via Phone and Password - (/api/user/auth/phone/login)
****/
export const loginViaphone = asyncError(async (req, res, next) => {
    const { phone, password } = req.body

    const user = await User.findOne({ where: { phone } })
    if (!user)
        return next(new ErrorHandler("Invalid Phone number or Password", 400))

    const isMatch = await user.isValidPassword(password)
    if (!isMatch)
        return next(new ErrorHandler("Invalid Email or Password", 400))

    sendCookie(res, user, "user") //send cookie
})


/**** 
Login via OTP - (/api/user/auth/otp/login)
****/
export const loginViaOtp = asyncError(async (req, res, next) => {
    const { email, phone } = req.body

    // Ensure only one of email or phone is processed
    if (email) req.body.phone = undefined
    if (phone) req.body.email = undefined

    const condition = { where: {} }
    if (email) condition.where.email = email
    else if (phone) condition.where.phone = phone

    const user = await User.findOne(condition)

    if (!user) {
        return next(
            new ErrorHandler(
                email
                    ? "Invalid email address or no user found with this email"
                    : "Invalid phone number or no user found with this phone",
                404))
    }

    //masked email
    const emailCopy = user?.email
    const [username, domain] = emailCopy.split('@')
    const masked = username.slice(0, 3) + "*".repeat(username.length - 5) + username.slice(-2) + "@" + domain

    const otp = apiFeature.getOtp() //get otp from api feature class
    const expiryTime = new Date(Date.now() + 2 * 60 * 1000) // OTP valid for 2 minutes

    //updating otp in table
    const [affectedRows] = await User.update({
        otp, otpDetails: 'Otp sent via email',
        status: false, otpExpiry: expiryTime
    }, condition)

    if (affectedRows === 0) {
        return next(new ErrorHandler(`Failed to send OTP. Please retry later`, 400))
    }

    //sending email
    const recipientEmail = email ? email : emailCopy
    const result = await apiFeature.sendOtp(recipientEmail, otp)
    if (!result)
        next(new ErrorHandler(`Failed to send OTP. Please retry later`, 400))

    res.status(200).json({
        success: true,
        message: (!email ? `OTP sent to your registered email ${masked}  with this Number` :
            "OTP sent to your registered email")
    })
}
)


/**** 
Verify OTP - (/api/user/auth/otp/verify)
****/
export const verifyOtp = asyncError(async (req, res, next) => {
    const { otp } = req.body

    const user = await User.findOne({ where: { otp, status: false, otpExpiry: { [Op.gt]: new Date() } } })
    if (!user)
        next(new ErrorHandler("Otp has been expired, Try again", 404))

    await User.update({ status: true, otp: null, otpExpiry: null, otpDetails: null }, { where: { otp } })

    sendCookie(res, user, "user")
})


/**** 
Update User - (/api/user/auth/update)
****/
export const updateUser = asyncError(async (req, res, next) => {
    const { name } = req.body
    const { user_id } = req.user

    const user = await User.findOne({ where: { user_id } })
    if (!user)
        return next(new ErrorHandler("User not found", 404))

    user.name = name || user.name
    await user.save()

    const { password, ...updateUser } = user.toJSON()

    res.status(200).json({
        success: true,
        message: "user has been updated",
        updateUser
    })
})

/**** 
Change Password - (/api/user/auth/changepassword)
****/
export const changePassword = asyncError(async (req, res, next) => {
    const { password, newPassword } = req.body
    const user = await User.findOne({ where: { email: req.user.email } })
    const isMatch = await user.isValidPassword(password)
    if (!isMatch)
        return next(new ErrorHandler("Invalid old Password ", 401))

    //updating password
    user.password = newPassword
    await user.save()

    res.status(200).json({
        success: true,
        message: "Password has been changed"
    })
})


/**** 
Logout User - (/api/user/auth/logout)
****/
export const logout = (req, res, next) => {
    res.status(200).cookie("userAuth", null, { maxAge: 0 }).json({
        succes: true,
        message: "Logged out succesfully"
    })
}


/**** 
Get Total Users Count - (/api/user/count)
****/
export const getAllUsersCount = asyncError(async (req, res, next) => {
    const count = await User.count()
    if (!count || count === 0)
        return next(new ErrorHandler("No users found", 404))
    res.status(200).json({
        success: true,
        count
    })
})


/**** 
Get All Users - (/api/user/all?page=1)
****/
export const getAllUsers = asyncError(async (req, res, next) => {
    let resPerPage = 10
    const features = new UserApiFeatures(User, req.query).search().paginate(resPerPage)

    const users = await features.query()

    if (!users || users.length === 0)
        return next(new ErrorHandler("No users found", 404))

    res.status(200).json({
        success: true,
        users,
    })
})


/****
Get User Details - (/api/user/auth/getme)
****/
export const getLoggedUser = asyncError(async (req, res, next) => {
    const { user_id } = req.user

    const user = await User.findOne({
        where: { user_id },
        attributes: { exclude: ['password', 'otp', 'otpDetails', 'otpExpiry'] }
    })

    if (!user)
        return next(new ErrorHandler("User not found", 404))

    res.status(200).json({
        success: true,
        message: "User details retrieved successfully",
        user
    })
})

/****
 * Get User Details by ID - (/api/user/auth/getuser/:id)
****/
export const getUserById = asyncError(async (req, res, next) => {
    const { id } = req.params

    const user = await User.findOne({
        where: { user_id: id },
        attributes: { exclude: ['password', 'otp', 'otpDetails', 'otpExpiry'] }
    })

    if (!user)
        return next(new ErrorHandler("User not found", 404))

    res.status(200).json({
        success: true,
        message: "User details retrieved successfully",
        user
    })
})

/****
 get users co-ordinates - (/api/user/track/getusercoordinates/:id)
****/
export const getUserCoordinates = asyncError(async (req, res, next) => {
    const { id } = req.params

    const user = await User.findOne({
        where: { user_id: id },
        attributes: ['latitude', 'longitude']
    })

    if (!user)
        return next(new ErrorHandler("User not found", 404))

    res.status(200).json({
        success: true,
        message: "User coordinates retrieved successfully",
        coordinates: {
            latitude: user.latitude,
            longitude: user.longitude
        }
    })
})

/****
 Update User Coordinates - (/api/user/track/updatecoordinates)
 ****/
export const updateUserCoordinates = asyncError(async (req, res, next) => {
    const { latitude, longitude } = req.body
    const { user_id } = req.user

    const user = await User.findOne({ where: { user_id } })
    if (!user)
        return next(new ErrorHandler("User not found", 404))

    user.latitude = latitude || user.latitude
    user.longitude = longitude || user.longitude
    await user.save()

    res.status(200).json({
        success: true,
        message: "User coordinates updated successfully",
        coordinates: {
            latitude: user.latitude,
            longitude: user.longitude
        }
    })
})

/****
 forgot password - (/api/user/auth/forgotpassword)  
****/
export const userForgotPassword = asyncError(async (req, res, next) => {
    const { email } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user)
        return next(new ErrorHandler("User with this email does not exist", 404))

    const resetToken = user.getResetPasswordToken()
    await user.save()

    //send reset password  link via email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/user/auth/resetpassword/${resetToken}`
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`
     const emailStatus=sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message})
    if(!emailStatus.status || emailStatus.status !== "Success")
        return next(new ErrorHandler("Failed to send reset password email", 500))
    res.status(200).json({
        success: true,
        message: `Reset password link has been sent to ${user.email}`
    })

})

/****
 reset password - (/api/user/auth/resetpassword/:resetToken)
****/
export const userResetPassword = asyncError(async (req, res, next) => {
    const { newPassword } = req.body
    const resetToken = req.params.resetToken

    const user = await User.findOne({
        where: {
            resetPasswordToken: resetToken,
            resetPasswordExpire: { [Op.gt]: new Date() }
        }
    })

    if (!user)
        return next(new ErrorHandler("Invalid or expired reset token", 400))

    user.password = newPassword
    user.resetPasswordToken = null
    user.resetPasswordExpire = null
    await user.save()

    res.status(200).json({
        success: true,
        message: "Password has been reset successfully"
    })
})