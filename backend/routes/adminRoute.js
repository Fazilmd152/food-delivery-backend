import exprees from 'express'
import { register, loginViaEmail, logout, loginViaPhone, loginViaOtp, verifyOtp ,updateAdmin,changePassword, getAllAdmins, getLoggedAdmin, adminForgetPassword, adminResetPassword} from '../controllers/adminController.js'
import Authorization from '../authourize/Authourization.js'
import isAuthenticate from '../middlewares/isAuthenticate.js'
import CommonValidation from '../validations/commonValidations.js'
import UniqueValidation from '../validations/uniqueValidation.js'


const route = exprees.Router()

//validation and authorization class instance
const cmnVal=new CommonValidation()
const uniVal=new UniqueValidation()
const authorize = new Authorization()

route
    .post('/auth/register', uniVal.adminRegisterVal, register)
    .post('/auth/email/login', cmnVal.loginVal, loginViaEmail)
    .post('/auth/phone/login', cmnVal.loginPhoneVal, loginViaPhone)
    .post('/auth/otp/login',cmnVal.otpVal, loginViaOtp)
    .post('/auth/otp/verify',cmnVal.otpVerifyVal, verifyOtp)
    .put('/auth/update',isAuthenticate,authorize.admin,uniVal.adminUpdVal,updateAdmin )
    .put('/auth/changepassword',isAuthenticate,authorize.admin,cmnVal.changePasswordVal,changePassword)
    .get('/all', isAuthenticate,authorize.admin, getAllAdmins)
    .get('/auth/getme',isAuthenticate,authorize.admin,getLoggedAdmin)
    .post('auth/forgotpassword',cmnVal.forgetPassVal,adminForgetPassword)
    .post('auth/resetpassword/:token',cmnVal.resetPasswordVal,adminResetPassword)
    .get('/auth/logout', logout)


export default route