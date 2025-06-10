import { body, validationResult } from 'express-validator'
import ErrorHandler from '../utils/ErrorHandler.js';

class Validation {
    constructor() { }

    adminValidation(type) {
        let validations = []

        if (type === 'register') {
            validations = [
                body("name")
                    .notEmpty().withMessage("Name is required")
                    .isLength({ min: 5 }).withMessage("Name must be at least 5 characters long")
                    .trim().customSanitizer(value => value.toLowerCase()),

                body("phone")
                    .notEmpty().withMessage("Phone number is required")
                    .isLength({ min: 10 }).withMessage("Phone number must be 10 characters")
                    .trim().customSanitizer(value => value.toLowerCase()),
            ]
        }

        // Common for both login and register
        validations.push(
            body("email")
                .notEmpty().withMessage("Email is required")
                .isEmail().withMessage("Valid email is required")
                .trim().customSanitizer(value => value.toLowerCase()),

            body("password")
                .notEmpty().withMessage("Password is required")
                .isLength({ min: 5 }).withMessage("Password must be at least 5 characters")
                //.matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
                //.withMessage("Password must contain at least one letter, one number, and one special character (@$!%*?&)")
                .trim().customSanitizer(value => value.toLowerCase()),

            // Final validation result handler
            (req, res, next) => {
                const errors = validationResult(req)
                if (!errors.isEmpty()) {
                    const [err] = errors.array()
                    return next(new ErrorHandler(err.msg, 400))
                }
                next()
            }
        )

        return validations
    }

    userUpdateBodyVal() {
        return [
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

    adminUpdateBodyVal() {
        return [
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

    loginPhoneBodyVal() {
        return [
            body("phone")
                .notEmpty().withMessage("Phone number is required")
                .isMobilePhone().withMessage("Invalid phone number format")
                .isLength({ min: 10 }).withMessage("Invalid phone number. Phone number must be 10 characters")
                .trim(),
            body("password")
                .notEmpty().withMessage("Password is required")
                .isLength({ min: 5 }).withMessage("Password must be at least 5 characters")
                .customSanitizer(value => value.toLowerCase())
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
    }

    changePassVal() {
        let validations = [
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

        return validations
    }

    forgetPassVal() {
        return [
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
    }
    resetPasswordVal() {
        return [
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
    }
}

export default Validation;
