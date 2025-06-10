import express from 'express'
import { registerRetaurant, loginViaEmail, logoutRetaurant, loginViaPhone, loginViaOtp, verifyOtp, updateRestaurant, getAllRestaurants, getRestaurant, getLoggedRestaurant, restaurantForgotPassword, restaurantResetPassword } from '../controllers/restaurantController.js'
import RestaurantValidation from '../libs/restaurantBodyValidation.js'
import isAuthenticate from '../middlewares/isAuthenticate.js'
import Authorization from '../libs/Authourization.js'
import UniqueValidation from '../validations/uniqueValidation.js'
import CommonValidation from '../validations/commonValidations.js'

const { registerVal, loginVal, forgetPassVal, resetPasswordVal, UpdateBodyVal, loginPhoneBodyVal: phoneVal, otpValidation, otpVerifyValidation } = new RestaurantValidation()
const route = express.Router()

//validation and authorization class instance
const cmnVal = new CommonValidation()
const uniVal = new UniqueValidation()
const authorize = new Authorization()

route.post('/auth/register', uniVal.RestaurantRegVal, registerRetaurant)
     .post('/auth/email/login', cmnVal.loginVal, loginViaEmail)
     .post('/auth/phone/login', cmnVal.loginPhoneVal, loginViaPhone)
     .post('/auth/otp/login', cmnVal.otpVal, loginViaOtp)
     .post('/auth/otp/verify', cmnVal.otpVerifyVal, verifyOtp)
     .put('/auth/update', isAuthenticate, authorize.restaurant, uniVal.restaurantUpdVal, updateRestaurant)
     .get('/all', isAuthenticate, getAllRestaurants)
     .get('/:id', isAuthenticate, getRestaurant)
     .get('/auth/getme', isAuthenticate, authorize.restaurant, getLoggedRestaurant)
     .post('/auth/forgotpassword', cmnVal.forgetPassVal, restaurantForgotPassword)
     .post('/auth/resetpassword/:resetToken', cmnVal.resetPasswordVal, restaurantResetPassword)
     .get('/auth/logout', logoutRetaurant)

export default route