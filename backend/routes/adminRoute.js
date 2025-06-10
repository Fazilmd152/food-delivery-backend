import exprees from 'express'
import { register, loginViaEmail, logout, loginViaPhone, loginViaOtp, verifyOtp ,updateAdmin,changePassword, getAllAdmins, getLoggedAdmin, adminForgetPassword, adminResetPassword} from '../controllers/adminController.js'
import Validation from '../libs/adminAndUserValidation.js'
import Authorization from '../libs/Authourization.js'
import isAuthenticate from '../middlewares/isAuthenticate.js'
const route = exprees.Router()

const { resetPasswordVal,adminValidation: bodyValidate ,adminUpdateBodyVal:updVal,changePassVal,loginPhoneBodyVal:phoneVal,forgetPassVal} = new Validation()
const {  admin} = new Authorization()

route
    .post('/auth/register', bodyValidate("register"), register)
    .post('/auth/email/login', bodyValidate(), loginViaEmail)
    .post('/auth/phone/login', phoneVal(), loginViaPhone)
    .post('/auth/otp/login', loginViaOtp)
    .post('/auth/otp/verify', verifyOtp)
    .put('/auth/update',isAuthenticate,admin,updVal(),updateAdmin )
    .put('/auth/changepassword',isAuthenticate,admin,changePassVal(),changePassword)
    .get('/all', isAuthenticate, admin, getAllAdmins)
    .get('/auth/logout', logout)
    .get('/auth/getme',isAuthenticate,admin,getLoggedAdmin)
    .post('auth/forgotpassword',forgetPassVal(),adminForgetPassword)
    .post('auth/resetpassword/:token',resetPasswordVal(),adminResetPassword)


export default route