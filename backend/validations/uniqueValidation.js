import { body, validationResult } from 'express-validator'
import ErrorHandler from '../utils/ErrorHandler.js'

class UniqueValidation {

    toLowerCaseArray = (value) => {
        if (!Array.isArray(value)) return value
        return value.map((item) => {
            if (typeof item === 'string') return item.toLowerCase()
            return item
        })
    }

    adminRegisterVal = [
        body("name")
            .notEmpty().withMessage("Name is required")
            .isLength({ min: 5 }).withMessage("Name must be at least 5 characters long")
            .trim().customSanitizer(value => value.toLowerCase()),
        body("phone")
            .notEmpty().withMessage("phone Number is required")
            .isMobilePhone().withMessage("Invalid phone number. Phone number must be 10 characters")
            .trim(),
        body("email")
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Valid email is required")
            .customSanitizer(value => value.toLowerCase()).trim(),

        body("password")
            .notEmpty().withMessage("Password is required")
            .isLength({ min: 5 }).withMessage("Password must be at least 5 characters")
            .customSanitizer(value => value.toLowerCase()).trim(),

        (req, res, next) => {
            const error = validationResult(req)
            if (!error.isEmpty()) {
                const [err] = error.array()
                return next(new ErrorHandler(err.msg, 400))
            }
            next()
        }
    ]

    adminUpdVal = [
        body("name")
            .optional().customSanitizer(value => value.toLowerCase()).trim(),
        (req, res, next) => {
            const error = validationResult(req)
            if (!error.isEmpty()) {
                const [err] = error.array()
                return next(new ErrorHandler(err.msg, 400))
            }
            next()
        }
    ]

    userRegisterVal = [
        body("name")
            .notEmpty().withMessage("Name is required")
            .isLength({ min: 5 }).withMessage("Name must be at least 5 characters long")
            .trim().customSanitizer(value => value.toLowerCase()),
        body("phone")
            .notEmpty().withMessage("phone Number is required")
            .isMobilePhone().withMessage("Invalid phone number. Phone number must be 10 characters")
            .trim(),
        body("email")
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Valid email is required")
            .customSanitizer(value => value.toLowerCase()).trim(),

        body("password")
            .notEmpty().withMessage("Password is required")
            .isLength({ min: 5 }).withMessage("Password must be at least 5 characters")
            .customSanitizer(value => value.toLowerCase()).trim(),

        (req, res, next) => {
            const error = validationResult(req)
            if (!error.isEmpty()) {
                const [err] = error.array()
                return next(new ErrorHandler(err.msg, 400))
            }
            next()
        }
    ]

    userUpdVal = [
        body("name")
            .optional().customSanitizer(value => value.toLowerCase()).trim(),
        (req, res, next) => {
            const error = validationResult(req)
            if (!error.isEmpty()) {
                const [err] = error.array()
                return next(new ErrorHandler(err.msg, 400))
            }
            next()
        }
    ]

    RestaurantRegVal = [
        body("name")
            .notEmpty().withMessage("Name is required")
            .isLength({ min: 5 }).withMessage("Name must be at least 5 characters long")
            .customSanitizer(value => value.toLowerCase()).trim(),

        body("phone")
            .notEmpty().withMessage("Phone number is required")
            .isLength({ min: 10 }).withMessage("Contact number must be 10 characters")
            .customSanitizer(value => value.toLowerCase()).trim(),

        body("email")
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Valid email is required")
            .trim(),

        body("password")
            .notEmpty().withMessage("Password is required")
            .isLength({ min: 5 }).withMessage("Password must be at least 5 characters")
            .customSanitizer(value => value.toLowerCase()).trim(),

        body('address.address')
            .trim().notEmpty().withMessage('Address is required').customSanitizer(value => value.toLowerCase()),

        body('address.pinCode')
            .trim().notEmpty().withMessage('Pin code is required').customSanitizer(value => value.toLowerCase()),

        body('address.city')
            .trim().notEmpty().withMessage('City is required').customSanitizer(value => value.toLowerCase()),

        body('address.state')
            .trim().notEmpty().withMessage('State is required').customSanitizer(value => value.toLowerCase()),

        body('address.country')
            .trim().notEmpty().withMessage('Country is required').customSanitizer(value => value.toLowerCase()),

        (req, res, next) => {
            const error = validationResult(req)
            if (!error.isEmpty()) {
                const [err] = error.array()
                return next(new ErrorHandler(err.msg, 400))
            }
            next()
        }
    ]

    restaurantUpdVal = [
        body("name").optional().customSanitizer(value => value.toLowerCase()).trim(),
        (req, res, next) => {
            const error = validationResult(req)
            if (!error.isEmpty()) {
                const [err] = error.array()
                return next(new ErrorHandler(err.msg, 400))
            }
            next()
        }
    ]

    addMenuVal = [
        body('restaurantId')
            .notEmpty()
            .withMessage('Restaurant ID is required')
            .isMongoId()
            .withMessage('Invalid Restaurant ID format')
            .customSanitizer(value => value.toLowerCase()).trim(),
        body('description')
            .notEmpty()
            .withMessage('Description is required')
            .isLength({ min: 15 })
            .withMessage('Description must be at least 15 characters long')
            .customSanitizer(value => value.toLowerCase()).trim(),
        body('type')
            .notEmpty()
            .withMessage('Type is required')
            .isIn(["breakfast", "lunch", "dinner", "snacks", "drinks"])
            .withMessage('Type must be one of: breakfast, lunch, dinner, snacks, drinks')
            .customSanitizer(value => value.toLowerCase()).trim(),
        (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const msg = errors.array()[0].msg
                return next(new ErrorHandler(msg, 400))
            }
            next()
        }
    ]

    addFoodVal = [
        body('name')
            .trim()
            .not().isEmpty().withMessage('Name is required')
            .isLength({ min: 3, max: 50 }).withMessage('Name must be between 3 and 50 characters')
            .customSanitizer(value => value.toLowerCase()).trim(),

        body('description')
            .trim()
            .not().isEmpty().withMessage('Description is required')
            .isLength({ min: 10, max: 200 }).withMessage('Description must be between 10 and 200 characters')
            .customSanitizer(value => value.toLowerCase()).trim(),

        body('price')
            .not().isEmpty().withMessage('Price is required')
            .isNumeric().withMessage('Price must be a number')
            .isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
            .customSanitizer(value => value.toLowerCase()).trim(),
        body('categories')
            .not().isEmpty().withMessage('Category is required')
            .isArray().withMessage('Category must be an array')
            .customSanitizer(value => value.toLowerCase()).trim(),
        body('tags')
            .optional()
            .isArray().withMessage('Tags must be an array')
            .customSanitizer(value => value.toLowerCase()).trim(),
        body('ingredients')
            .optional()
            .isArray().withMessage('Ingredients must be an array')
            .customSanitizer(value => value.toLowerCase()).trim(),
        (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const msg = errors.array()[0].msg
                return next(new ErrorHandler(msg, 400))
            }
            next()
        }
    ]

    foodUpdateVal = [
        body("description")
            .optional()
            .isLength({ min: 15 })
            .withMessage("Description must be at least 15 characters long")
            .customSanitizer(value => value.toLowerCase()).trim(),
        body("type")
            .optional().customSanitizer(value => value.toLowerCase()).trim(),
        body("isAvailable")
            .optional(),
        body('name')
            .optional()
            .trim()
            .customSanitizer(value => value.toLowerCase())
            .isLength({ min: 3, max: 50 }).withMessage('Name must be between 3 and 50 characters'),
        body('price')
            .optional()
            .isNumeric().withMessage('Price must be a number')
            .isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
        body('categories')
            .optional()
            .isArray().withMessage('Categories must be an array')
            .customSanitizer(value => value.toLowerCase()),

        body('image_url')
            .optional()
            .isArray().withMessage('Image URL must be an array')
            .customSanitizer(value => value.toLowerCase()),

        body('tags')
            .optional()
            .isArray().withMessage('Tags must be an array')
            .customSanitizer(value => value.toLowerCase()),

        body('ingredients')
            .optional()
            .isArray().withMessage('Ingredients must be an array')
            .customSanitizer(value => value.toLowerCase()),
        (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const msg = errors.array()[0].msg
                return next(new ErrorHandler(msg, 400))
            }
            next()
        }
    ]

    deliveryPersonRegVal = [
        body("name")
            .notEmpty().withMessage("Name is required")
            .isLength({ min: 5 }).withMessage("Name must be at least 5 characters long")
            .customSanitizer(value => value.toLowerCase()).trim(),

        body("phone")
            .notEmpty().withMessage("Phone number is required")
            .isMobilePhone().withMessage("Invalid phone number. Phone number must be 10 characters")
            .customSanitizer(value => value.toLowerCase()).trim(),

        body("email")
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Valid email is required")
            .customSanitizer(value => value.toLowerCase()).trim(),

        body("password")
            .notEmpty().withMessage("Password is required")
            .isLength({ min: 5 }).withMessage("Password must be at least 5 characters")
            .customSanitizer(value => value.toLowerCase()).trim(),
        body('vehicleType')
            .trim()
            .toLowerCase()
            .not().isEmpty().withMessage('Vehicle type is required'),
        body('vehicleNumber')
            .trim()
            .not().isEmpty().withMessage('Vehicle number is required')
            .isLength({ min: 5, max: 15 }).withMessage('Vehicle number must be between 5 and 15 characters'),
        body("vehicleDetails")
            .notEmpty().withMessage("Vehicle details are required")
            .isString().withMessage("Vehicle details must be a string")
            .trim(),

        body("drivingLicenseNo")
            .notEmpty().withMessage("Driving license number is required")
            .isString().withMessage("Driving license number must be a string")
            .matches(/^[A-Za-z0-9]+$/).withMessage("Driving license number can only contain alphanumeric characters")
            .trim(),
        (req, res, next) => {
            const error = validationResult(req)
            if (!error.isEmpty()) {
                const [err] = error.array()
                return next(new ErrorHandler(err.msg, 400))
            }
            next()
        }
    ]

    deliveryPersonUpdateVAl = [
        body("name")
            .optional().customSanitizer(value => value.toLowerCase()).trim(),
        body('vehicleType')
            .optional()
            .trim()
            .toLowerCase()
            .not().isEmpty().withMessage('Vehicle type is required'),
        body('vehicleNumber')
            .optional()
            .trim()
            .not().isEmpty().withMessage('Vehicle number is required')
            .isLength({ min: 5, max: 15 }).withMessage('Vehicle number must be between 5 and 15 characters'),

        (req, res, next) => {
            const error = validationResult(req)
            if (!error.isEmpty()) {
                const [err] = error.array()
                return next(new ErrorHandler(err.msg, 400))
            }
            next()
        }
    ]

    addReviewVal = [
        body("rating")
            .notEmpty().withMessage("Rating is required")
            .isNumeric().withMessage("Rating must be a number")
            .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),

        body("comment")
            .notEmpty().withMessage("Comment is required")
            .isLength({ min: 5 }).withMessage("Comment must be at least 5 characters")
            .customSanitizer(value => value.toLowerCase()).trim(),
        (req, res, next) => {
            const error = validationResult(req)
            if (!error.isEmpty()) {
                const [err] = error.array()
                return next(new ErrorHandler(err.msg, 400))
            }
            next()
        }
    ]

    updateReviewVal = [
        body("rating")
            .optional()
            .isNumeric().withMessage("Rating must be a number")
            .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),

        body("comment")
            .optional()
            .isLength({ min: 5 }).withMessage("Comment must be at least 5 characters")
            .customSanitizer(value => value.toLowerCase()).trim(),
        (req, res, next) => {
            const error = validationResult(req)
            if (!error.isEmpty()) {
                const [err] = error.array()
                return next(new ErrorHandler(err.msg, 400))
            }
            next()
        }
    ]

    placeOrderVal = [
        body('foodId')
            .not().isEmpty().withMessage('Food ID is required')
            .isMongoId().withMessage('Invalid Food ID'),
        body('quantity')
            .not().isEmpty().withMessage('Quantity is required')
            .isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
        body('price')
            .not().isEmpty().withMessage('Price is required')
            .isNumeric({ min: 0 }).withMessage('Price must be a non-negative number'),
        body('totalAmount')
            .not().isEmpty().withMessage('Total Amount is required')
            .isFloat({ min: 0 }).withMessage('Total Amount must be a non-negative number'),
        body('deliveryAddress.street')
            .not().isEmpty().withMessage('Street is required'),
        body('deliveryAddress.city')
            .not().isEmpty().withMessage('City is required'),
        body('deliveryAddress.pincode')
            .not().isEmpty().withMessage('Pincode is required')
            .isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 digits'),
        body('deliveryAddress.coordinates.lat')
            .not().isEmpty().withMessage('Latitude is required')
            .isFloat().withMessage('Latitude must be a number'),
        body('deliveryAddress.coordinates.lng')
            .not().isEmpty().withMessage('Longitude is required')
            .isFloat().withMessage('Longitude must be a number'),
        body('paymentMethod')
            .not().isEmpty().withMessage('Payment method is required')
            .isIn(['cod', 'online']).withMessage('Invalid payment method'),
    ]

    orderUpdatedByRestaurntVal = [
        body('status')
            .optional()
            .isIn(['preparing', 'ready'])
            .withMessage("Status must be either 'preparing' or 'ready'"),
        body('extendedTime')
            .optional()
            .isInt({ min: 1 })
            .withMessage("Extended time must be a positive number (in minutes)"),
        (req, res, next) => {
            const error = validationResult(req)
            if (!error.isEmpty()) {
                const [err] = error.array()
                return next(new ErrorHandler(err.msg, 400))
            }
            next()
        }
    ]
}

export default UniqueValidation