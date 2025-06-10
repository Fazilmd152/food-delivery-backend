import jwt from "jsonwebtoken"
import AdminModel from "../models/adminModel.js"
import ErrorHandler from "../utils/ErrorHandler.js"
import User from "../models/userModel.js"
import { config } from "dotenv"
import RestModel from "../models/restaurantModel.js"
import DeliveryModel from "../models/deliveryPersonModel.js"
config()

async function isAuthenticate(req, res, next) {
    const { adminAuth, userAuth, restaurantAuth, delivery_personAuth } = req.cookies
    if (!adminAuth && !userAuth && !restaurantAuth)
        next(new ErrorHandler("Login before to access this resources", 400))


    const token = adminAuth || userAuth || restaurantAuth
    const { email } = jwt.verify(token, process.env.JWT_SECRET)

    //Admin table
    if (adminAuth && !userAuth && !restaurantAuth && !delivery_personAuth) {
        const admin = await AdminModel.findOne({ where: { email: email } })
        if (admin) {
            req.admin = admin
            return next()
        }
    }

    //User table
    if (userAuth && !adminAuth && !restaurantAuth && !delivery_personAuth) {
        const user = await User.findOne({ where: { email: email } })
        if (user) {
            req.user = user
            return next()
        }
    }

    //restaurant table
    if (restaurantAuth && !userAuth && !adminAuth && !delivery_personAuth) {
        const restaurant = await RestModel.findOne({ email })
        if (restaurant) {
            req.restaurant = restaurant
            return next()
        }
    }

    //Delivery partner table
    if (delivery_personAuth && !userAuth && !adminAuth && !restaurantAuth) {
        const deliveryPerson = await DeliveryModel.findOne({ email })
        if (restaurant) {
            req.delivery_person = deliveryPerson
            return next()
        }
    }

    return next(new ErrorHandler("No credentials found with this email", 404))
}

export default isAuthenticate