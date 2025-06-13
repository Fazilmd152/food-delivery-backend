import express from 'express'
import isAuthenticate from '../middlewares/isAuthenticate.js'
import Authorization from '../authourize/Authourization.js'
import UniqueValidation from '../validations/uniqueValidation.js'
import { createOrder, updateOrderByRestaurant } from '../controllers/orderController.js'
import validateOrder from '../validations/placeOrderValidation.js'


const route = express.Router()

//validation and authorization class instance
//const cmnVal = new CommonValidation()
const uniVal = new UniqueValidation()
const authorize = new Authorization()


route.post('/placeorder/:restaurantId',isAuthenticate,authorize.user,validateOrder,createOrder)
route.put('/updatebyrestaurant/:orderId',isAuthenticate,authorize.restaurant,uniVal.orderUpdatedByRestaurntVal,updateOrderByRestaurant)
route.put('/deliveryperson/update/order/:orderId',isAuthenticate,authorize.deliveryPerson,)


export default route