import { body, validationResult } from 'express-validator'
import ErrorHandler from '../utils/ErrorHandler.js'

class UniqueValidation {
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
}

export default UniqueValidation