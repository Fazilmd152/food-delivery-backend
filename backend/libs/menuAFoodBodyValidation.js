import { body, validationResult } from 'express-validator'
import ErrorHandler from '../utils/ErrorHandler.js'

class MenuAFoodBodyValidation {
    constructor() { }

    addMenuBodyVal() {
        return [
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
    }

    addFoodBodyVal() {
        return [
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
    }

    updateBodyVal() {
        const toLowerCaseArray = (value) => {
            if (!Array.isArray(value)) return value
            return value.map((item) => {
                if (typeof item === 'string') return item.toLowerCase()
                return item
            })
        }
        return [
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
                .customSanitizer(toLowerCaseArray),

            body('image_url')
                .optional()
                .isArray().withMessage('Image URL must be an array')
                .customSanitizer(toLowerCaseArray),

            body('tags')
                .optional()
                .isArray().withMessage('Tags must be an array')
                .customSanitizer(toLowerCaseArray),

            body('ingredients')
                .optional()
                .isArray().withMessage('Ingredients must be an array')
                .customSanitizer(toLowerCaseArray),
            (req, res, next) => {
                const errors = validationResult(req)
                if (!errors.isEmpty()) {
                    const msg = errors.array()[0].msg
                    return next(new ErrorHandler(msg, 400))
                }
                next()
            }
        ]
    }

}

export default MenuAFoodBodyValidation