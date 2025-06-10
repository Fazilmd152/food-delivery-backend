import { body, validationResult } from "express-validator";
import ErrorHandler from "../utils/ErrorHandler.js";

class HotelValidation {
  registerVal = [
    body("name")
      .notEmpty().withMessage("Name is required")
      .isLength({ min: 5 }).withMessage("Name must be at least 5 characters long")
      .customSanitizer(value => value.toLowerCase()).trim(),

    body("contact_number")
      .notEmpty().withMessage("Contact number is required")
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

  UpdateBodyVal = [
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

  loginPhoneBodyVal = [
    body("contact_number")
      .notEmpty().withMessage("Contact Number is required")
      .isLength({ min: 10 }).withMessage("Invalid phone number. Phone number must be 10 characters")
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

  otpValidation = [
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

  otpVerifyValidation = [
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
}


export default HotelValidation