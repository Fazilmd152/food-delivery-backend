import express from 'express'
import isAuthenticate from '../middlewares/isAuthenticate.js'
import Authorization from '../authourize/Authourization.js'
import UniqueValidation from '../validations/uniqueValidation.js'
import { createOrder } from '../controllers/orderController.js'


const route = express.Router()

//validation and authorization class instance
//const cmnVal = new CommonValidation()
const uniVal = new UniqueValidation()
const authorize = new Authorization()


route.post('/placeorder/:restaurantId',isAuthenticate,authorize.user,createOrder)


export default route