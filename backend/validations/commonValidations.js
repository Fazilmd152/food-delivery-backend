import {body,validationResult} from 'express-validator'
import ErrorHandler from '../utils/ErrorHandler.js'

class CommonValidation {

    changePasswordVal = [
        body("password")
            .notEmpty().withMessage("Current password is required").customSanitizer(value => value.toLowerCase())
            .trim(),

        body("newPassword")
            .notEmpty().withMessage("New password is required")
            .isLength({ min: 6 }).withMessage("New password must be at least 6 characters").customSanitizer(value => value.toLowerCase())
            .trim(),

        body("confirmPassword")
            .notEmpty().withMessage("Confirm password is required")
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error("Confirm password does not match new password")
                }
                return true
            }).customSanitizer(value => value.toLowerCase()).trim(),

        (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const [err] = errors.array()
                return next(new ErrorHandler(err.msg, 400))
            }
            next()
        }
    ]

    resetPasswordVal = [
        body("newPassword")
            .notEmpty().withMessage("New password is required")
            .isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
            .customSanitizer(value => value.toLowerCase())
            .trim(),
        body("confirmPassword").notEmpty().withMessage("Confirm password is required"),
        body("confirmPassword")
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error("Confirm password does not match new password")
                }
                return true
            }).customSanitizer(value => value.toLowerCase()).trim(),
        (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const [err] = errors.array()
                return next(new ErrorHandler(err.msg, 400))
            }
            next()
        }
    ]

    otpVal = [
        body().custom((value, { req }) => {
            const { email, contact_number } = req.body || {}

            if (!email && !contact_number) {
                throw new Error("Either email or contact_number is required.")
            }

            if (email && contact_number) {
                throw new Error("Provide only one: email or contact_number, not both.")
            }

            return true
        }),

        (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const msg = errors.array()[0].msg
                return next(new ErrorHandler(msg, 400))
            }
            next()
        }
    ]

    otpVerifyVal = [
        body("otp")
            .notEmpty().withMessage("OTP is required")
            .isLength({ min: 6, max: 6 }).withMessage("OTP must be exactly 6 characters"),

        (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const msg = errors.array()[0].msg
                return next(new ErrorHandler(msg, 400))
            }
            next()
        }
    ]

    forgetPassVal = [
        body("email")
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Valid email is required")
            .trim().customSanitizer(value => value.toLowerCase()),

        (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const [err] = errors.array()
                return next(new ErrorHandler(err.msg, 400))
            }
            next()
        }
    ]

    resetPasswordVal = [
        body("newPassword")
            .notEmpty().withMessage("New password is required")
            .isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
            .customSanitizer(value => value.toLowerCase())
            .trim(),
        body("confirmPassword").notEmpty().withMessage("Confirm password is required"),
        body("confirmPassword")
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error("Confirm password does not match new password")
                }
                return true
            }).customSanitizer(value => value.toLowerCase()).trim(),
        (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const [err] = errors.array()
                return next(new ErrorHandler(err.msg, 400))
            }
            next()
        }
    ]

    loginVal = [
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

    loginPhoneVal = [
        body("phone")
            .notEmpty().withMessage("phone Number is required")
            .isMobilePhone().withMessage("Invalid phone number. Phone number must be 10 characters")
            .trim(),

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
}

export default CommonValidation