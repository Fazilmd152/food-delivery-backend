import express from 'express'
const route = express.Router()
import { registerRetaurant, loginViaEmail, logoutRetaurant, loginViaPhone, loginViaOtp, verifyOtp, updateRestaurant, getAllRestaurants, getRestaurant, getLoggedRestaurant, restaurantForgotPassword, restaurantResetPassword } from '../controllers/restaurantController.js'
import RestaurantValidation from '../libs/restaurantBodyValidation.js'
import isAuthenticate from '../middlewares/isAuthenticate.js'
import Authorization from '../libs/Authourization.js'

const { registerVal, loginVal,forgetPassVal,resetPasswordVal, UpdateBodyVal, loginPhoneBodyVal: phoneVal, otpValidation, otpVerifyValidation } = new RestaurantValidation()
const { restaurant, admin } = new Authorization()// Authorization middleware

route.post('/auth/register', registerVal, registerRetaurant)
route.post('/auth/email/login', loginVal, loginViaEmail)
route.post('/auth/phone/login', phoneVal, loginViaPhone)
     .post('/auth/otp/login', otpValidation, loginViaOtp)
     .post('/auth/otp/verify', otpVerifyValidation, verifyOtp)
route.put('/auth/update', isAuthenticate, restaurant, UpdateBodyVal, updateRestaurant)
route.get('/auth/logout', logoutRetaurant)
route.get('/all', isAuthenticate, getAllRestaurants)
     .get('/:id', isAuthenticate, getRestaurant)
     .get('/auth/getme', isAuthenticate, restaurant, getLoggedRestaurant)
     .post('/auth/forgotpassword',forgetPassVal,restaurantForgotPassword) 
     .post('/auth/resetpassword/:resetToken',resetPasswordVal, restaurantResetPassword)

export default route