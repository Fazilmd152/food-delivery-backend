import express from 'express'

import isAuthenticate from '../middlewares/isAuthenticate.js'
import Authorization from '../authourize/Authourization.js'
import UniqueValidation from '../validations/uniqueValidation.js'
import CommonValidation from '../validations/commonValidations.js'
import { changeDeliveryPersonPassword, deleteDeliveryPerson, forgotDeliveryPersonPassword, getAllDeliveryPersons, getDeliveryPersonById, getDeliveryPersonCoordinates, getDeliveryPersonProfile, loginViaEmail, loginViaOtp, loginViaPhone, registerDeliveryPerson, resetDeliveryPersonPassword, updateDeliveryPersonCoordinates, updateDeliveryPersonProfile, verifyOtp } from '../controllers/deliveryPersonController.js'
import { addReview, deleteReview, getAllReviews, getReviewById, updateReview } from '../controllers/reviewController.js'


const route = express.Router()

//validation and authorization class instance
const cmnVal = new CommonValidation()
const uniVal = new UniqueValidation()
const authorize = new Authorization()

route.post('/auth/register', uniVal.deliveryPersonRegVal, uniVal.deliveryPersonRegVal, registerDeliveryPerson)
    .post('/auth/email/login', cmnVal.loginVal, loginViaEmail)
    .post('/auth/otp/login', cmnVal.otpVal, loginViaOtp)
    .post('/auth/otp/verify', cmnVal.otpVerifyVal, verifyOtp)
    .post('/auth/phone/login', cmnVal.loginPhoneVal, loginViaPhone)
    .put("/profile/update", isAuthenticate, authorize.deliveryPerson, uniVal.deliveryPersonUpdateVAl, updateDeliveryPersonProfile)
    .post('/auth/changepassword', isAuthenticate, authorize.deliveryPerson, cmnVal.changePasswordVal, changeDeliveryPersonPassword)
    .get('/auth/getme', isAuthenticate, authorize.deliveryPerson, getDeliveryPersonProfile)
    .post('/auth/forgotpassword', cmnVal.forgetPassVal, forgotDeliveryPersonPassword)
    .post('/auth/resetpassword/:resetToken', cmnVal.resetPasswordVal, resetDeliveryPersonPassword)
    .get('/all', isAuthenticate, authorize.admin, getAllDeliveryPersons)
    .get('/get/:id', isAuthenticate, getDeliveryPersonById)
    .get('/delete/:id', isAuthenticate, authorize.admin, deleteDeliveryPerson)
    .get('/track/coordinates/:id', isAuthenticate, getDeliveryPersonCoordinates)
    .put('/track/updatecoordinates', isAuthenticate, authorize.deliveryPerson, updateDeliveryPersonCoordinates)
    .post('/review/add',isAuthenticate,authorize.user,uniVal.addReviewVal,addReview)
    .put('/review/update/:id',isAuthenticate,authorize.user,uniVal.updateReviewVal,updateReview)
    .get('/review/:id',isAuthenticate,getReviewById)
    .get('/review/all/:id',isAuthenticate,getAllReviews)
    .delete('/review/delete/:id',isAuthenticate,authorize.user,deleteReview)


export default route