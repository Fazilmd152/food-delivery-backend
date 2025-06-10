import { Op } from "sequelize"
import AdminModel from "../models/adminModel.js" //mysql sequelize model
import ApiFeatures from "../utils/ApiFeatures.js"
import asyncError from "../utils/asyncError.js"
import ErrorHandler from "../utils/ErrorHandler.js"
import sendCookie from "../utils/jwt.js"
import sendEmail from "../utils/sendEmail.js"
const apiFeature = new ApiFeatures()



/**** 
Register a new admin - (/api/admin/auth/register)
****/
export const register = asyncError(async (req, res, next) => {
    const { name, email, password, phone } = req.body

    const existingAdmin = await AdminModel.findOne({ where: { email } })
    if (existingAdmin)
        return next(new ErrorHandler("Admin with this email already exists", 400))

    const admin = await AdminModel.create({ name, email, password, phone })
    if (!admin)
        return next(new ErrorHandler("registraion failed", 404))

   sendCookie(res,admin,"admin")
})


/**** 
Login via email and password - (/api/admin/auth/login)
****/
export const loginViaEmail = asyncError(async (req, res, next) => {
    const { email, password } = req.body

    const admin = await AdminModel.findOne({ where: { email } })
    if (!admin)
        return next(new ErrorHandler("Invalid Email or Password", 400))

    const isMatch = await admin.isValidPassword(password)
    if (!isMatch)
        return next(new ErrorHandler("Invalid Email or Password", 400))

    sendCookie(res, admin,"admin") //send cookie
})



/**** 
Login via phone and password - (/api/admin/auth/phone/login)
****/
export const loginViaPhone = asyncError(async (req, res, next) => {
    const { phone, password } = req.body

    const admin = await AdminModel.findOne({ where: { phone } })
    if (!admin)
        return next(new ErrorHandler("Invalid Phone number or Password", 400))

    const isMatch = await admin.isValidPassword(password)
    if (!isMatch)
        return next(new ErrorHandler("Invalid Email or Password", 400))

    sendCookie(res, admin,"admin") //send cookie
})


/**** 
Login via OTP - (/api/admin/auth/otp/login)
****/
export const loginViaOtp = asyncError(async (req, res, next) => {
    const { email, phone } = req.body

    // Ensure only one of email or phone is processed
    if (email) req.body.phone = undefined
    if (phone) req.body.email = undefined

    const condition = { where: {} }
    if (email) condition.where.email = email
    else if (phone) condition.where.phone = phone

    const admin = await AdminModel.findOne(condition)

    if (!admin) {
        return next(
            new ErrorHandler(
                email
                    ? "Invalid email address or no admin found with this email"
                    : "Invalid phone number or no admin found with this phone",
                404))
    }

    //masked email
    const emailCopy = admin?.email
    const [adminName, domain] = emailCopy.split('@')
    const masked = adminName.slice(0, 3) + "*".repeat(adminName.length - 5) + adminName.slice(-2) + "@" + domain

    const otp = apiFeature.getOtp() //get otp from api feature class
    const expiryTime = new Date(Date.now() + 2 * 60 * 1000) // OTP valid for 2 minutes

    //updating otp in table
    const [affectedRows] = await AdminModel.update({
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
Verify OTP - (/api/admin/auth/otp/verify)
****/
export const verifyOtp = asyncError(async (req, res, next) => {
    const { otp } = req.body

    const admin = await AdminModel.findOne({ where: { otp, status: false, otpExpiry: { [Op.gt]: new Date() } } })
    if (!admin)
        next(new ErrorHandler("Otp has been expired, Try again", 404))

    await AdminModel.update({ status: true, otp: null, otpExpiry: null, otpDetails: null }, { where: { otp } })

    sendCookie(res, admin,"admin")
})


/**** 
Update admin details - (/api/admin/auth/update)
****/
export const updateAdmin = asyncError(async (req, res, next) => {
    const { name } = req.body
    const { admin_id } = req.admin

    const admin = await AdminModel.findOne({ where: { admin_id } })
    if (!admin)
        return next(new ErrorHandler("Admin not found", 404))

    admin.name = name || admin.name
    await admin.save()

    const { password, ...updateadmin } = admin.toJSON()

    res.status(200).json({
        success: true,
        message: "Admin has been updated",
        updateadmin
    })
})

/**** 
Change password - (/api/admin/auth/changepassword)
****/
export const changePassword = asyncError(async (req, res, next) => {
    const { password, newPassword } = req.body
    const admin = await AdminModel.findOne({ where: { email: req.admin.email } })
    const isMatch = await admin.isValidPassword(password)
    if (!isMatch)
        return next(new ErrorHandler("Invalid old Password ", 401))

    //updating password
    admin.password = newPassword
    await admin.save()

    res.status(200).json({
        success: true,
        message: "Password has been changed"
    })
})

/**** 
Get all admins - (/api/admin/all)
****/
export const getAllAdmins = asyncError(async (req, res, next) => {
    const admins = await AdminModel.findAll({
        attributes: { exclude: ['password', 'otp', 'otpDetails', 'otpExpiry'] }
    })

    if (!admins || admins.length === 0)
        return next(new ErrorHandler("No admins found", 404))

    res.status(200).json({
        success: true,
        message: "Admins retrieved successfully",
        admins
    })
})

/**** 
Logout admin - (/api/admin/auth/logout)
****/
export const logout=(req,res,next)=>{
    res.status(200).cookie("adminAuth", null, { maxAge: 0 }).json({
        succes: true,
        message: "Loggedout succesfully"
    })
}


/****
Get admin details - (/api/admin/auth/getme)
****/
export const getLoggedAdmin = asyncError(async (req, res, next) => {
    const { admin_id } = req.admin

    const admin = await AdminModel.findOne({
        where: { admin_id },
        attributes: { exclude: ['password', 'otp', 'otpDetails', 'otpExpiry'] }
    })

    if (!admin)
        return next(new ErrorHandler("Admin not found", 404))

    res.status(200).json({
        success: true,
        message: "Admin details retrieved successfully",
        admin
    })
})


/*****
 forget password - (/api/admin/auth/forgotpassword)
 *****/
export const adminForgetPassword = asyncError(async (req, res, next) => {
    const { email } = req.body

    const admin = await AdminModel.findOne({ where: { email } })
    if (!admin)
        return next(new ErrorHandler("Admin not found with this email", 404))

    const resetToken = admin.getResetPasswordToken() //generate reset token using model method
    if (!resetToken)
        return next(new ErrorHandler("Failed to generate reset token", 500))

    await admin.save()
    //frontend url to reset password
    const resetUrl = `${req.protocol}://${req.get("host")}/api/admin/auth/resetpassword/${resetToken}`
    const message = `Reset your password by clicking on the link: \n\n ${resetUrl} \n\n If you did not request this, please ignore this email.`
    const emailStatus=await sendEmail({
        email: admin.email,
        subject: "Admin Password Reset",
        message
    })

    if(!emailStatus.status || emailStatus.status !== "Success")
        return next(new ErrorHandler("Failed to send reset password email", 500))
    res.status(200).json({
        success: true,
        message: `Reset password link has been sent to ${admin.email}`
    })
})

/****
Reset password - (/api/admin/auth/resetpassword/:token)
****/
export const adminResetPassword = asyncError(async (req, res, next) => {
    const { token } = req.params
    const { newPassword } = req.body

    //find admin with reset token
    const admin = await AdminModel.findOne({
        where: {
            resetPasswordToken: token,
            resetPasswordExpire: { [Op.gt]: new Date() }
        }
    })

    if (!admin)
        return next(new ErrorHandler("Invalid or expired reset token", 400))

    //update password
    admin.password = newPassword
    admin.resetPasswordToken = null
    admin.resetPasswordExpire = null
    await admin.save()

    res.status(200).json({
        success: true,
        message: "Password has been reset successfully"
    })
})

 
 









