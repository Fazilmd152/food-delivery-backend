import ErrorHandler from "../utils/ErrorHandler.js"

class Authorization {
    admin(req, res, next) {
        const admin = req.admin;
        if (!admin) {
            return next(new ErrorHandler("Unauthorized: Admin access only", 403))
        }
        if (admin.role !== "admin") {
            return next(new ErrorHandler("You are not authorized to access this.", 403))
        }
        next()
    }

    user(req, res, next) {
        const user = req.user
        if (!user) {
            return next(new ErrorHandler("Unauthorized: User access only", 403))
        }
        if (user.role !== "user") {
            return next(new ErrorHandler("You are not authorized to access this.", 403))
        }
        next()
    }

    restaurant(req, res, next) {
        const restaurant = req.restaurant
        if (!restaurant) {
            return next(new ErrorHandler("Unauthorized: Restaurant access only", 403))
        }
        if (restaurant.role !== "restaurant") {
            return next(new ErrorHandler("You are not authorized to access this.", 403))
        }
        next()
    }

    deliveryPerson(req, res, next) {
        const deliveryPerson = req.deliveryPerson
        if (!deliveryPerson) {
            return next(new ErrorHandler("Unauthorized: Delivery Person access only", 403))
        }
        if (deliveryPerson.role !== "delivery_person") {
            return next(new ErrorHandler("You are not authorized to access this.", 403))
        }
        next()
    }
}

export default Authorization