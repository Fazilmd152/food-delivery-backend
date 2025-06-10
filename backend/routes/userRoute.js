import express from 'express'
import { changePassword, getAllUsers, getAllUsersCount, getLoggedUser, getUserById, getUserCoordinates, loginViaMail, loginViaOtp, loginViaphone, logout, register, updateUser, updateUserCoordinates, userForgotPassword, userResetPassword, verifyOtp } from '../controllers/userController.js'
import isAuthenticate from '../middlewares/isAuthenticate.js'
import Authorization from '../authourize/Authourization.js'
import UniqueValidation from '../validations/uniqueValidation.js'
import CommonValidation from '../validations/commonValidations.js'


const route = express.Router()

//validation and authorization class instance
const cmnVal = new CommonValidation()
const uniVal = new UniqueValidation()
const authorize = new Authorization()

route
    .post('/auth/register', uniVal.userRegisterVal, register)
    .post('/auth/email/login', cmnVal.loginVal, loginViaMail)
    .post('/auth/phone/login', cmnVal.loginPhoneVal, loginViaphone)
    .post('/auth/otp/login', cmnVal.otpVal,loginViaOtp)
    .post('/auth/otp/verify',cmnVal.otpVerifyVal, verifyOtp)
    .put('/auth/update', isAuthenticate, uniVal.userUpdVal, authorize.user, updateUser)
    .put('/auth/changepassword', isAuthenticate, cmnVal.changePasswordVal, authorize.user, changePassword)
    .get('/count', isAuthenticate, authorize.admin, getAllUsersCount)
    .get('/all', isAuthenticate, authorize.admin, getAllUsers)
    .get('/auth/getme', isAuthenticate, authorize.user, getLoggedUser)
    .get('/auth/forgotpassword', cmnVal.forgetPassVal, userForgotPassword)
    .post('/auth/resetpassword/:resetToken', cmnVal.resetPasswordVal, userResetPassword)
    .get('/auth/getuser/:id', isAuthenticate, authorize.admin, getUserById) // This route is for admin to get user details by ID
    .get('/track/getusercoordinates/:id', isAuthenticate, getUserCoordinates)
    .put('/track/updatecoordinates', isAuthenticate, cmnVal.updateCoordinatesVal, updateUserCoordinates)
    .get('/auth/logout', logout)


export default route

