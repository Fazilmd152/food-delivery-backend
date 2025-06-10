import express from 'express'
import Validation from '../libs/adminAndUserValidation.js'
import { changePassword, getAllUsers, getAllUsersCount, getLoggedUser, loginViaMail, loginViaOtp, loginViaphone, logout, register, updateUser, userForgotPassword, userResetPassword, verifyOtp } from '../controllers/userController.js'
import isAuthenticate from '../middlewares/isAuthenticate.js'
import Authorization from '../libs/Authourization.js'


const route = express.Router()

const {resetPasswordVal,forgetPassVal, adminValidation: bodyValidate, userUpdateBodyVal: updVal, loginPhoneBodyVal: phoneVal,changePassVal } = new Validation()
const {user,admin}=new Authorization()

route
    .post('/auth/register', bodyValidate("register"), register)
    .post('/auth/email/login', bodyValidate(), loginViaMail)
    .post('/auth/phone/login', phoneVal(), loginViaphone)
    .post('/auth/otp/login',loginViaOtp)
    .post('/auth/otp/verify', verifyOtp)
    .put('/auth/update',isAuthenticate,updVal(), user,updateUser)
    .put('/auth/changepassword',isAuthenticate, changePassVal(),user, changePassword)
    .get('/auth/logout', logout)
    .get('/count', isAuthenticate,admin,getAllUsersCount)
    .get('/all', isAuthenticate,admin,getAllUsers)
    .get('/auth/getme', isAuthenticate, user, getLoggedUser)
    .get('/auth/forgotpassword', forgetPassVal(),userForgotPassword)
    .post('/auth/resetpassword/:resetToken',resetPasswordVal(),userResetPassword)
    
    


export default route

