import { checkSchema, validationResult } from 'express-validator'
import ErrorHandler from '../utils/ErrorHandler.js'

 const validateOrder = [
  checkSchema({
    'items': {
      in: ['body'],
      isArray: {
        errorMessage: 'Items must be an array',
      }
    },
    'items.*.foodId': {
      in: ['body'],
      isMongoId: {
        errorMessage: 'Each item must have a valid foodId',
      }
    },
    'items.*.quantity': {
      in: ['body'],
      isInt: {
        options: { min: 1 },
        errorMessage: 'Quantity must be at least 1',
      }
    },
    'items.*.notes': {
      optional: true,
      isString: {
        errorMessage: 'Notes must be a string',
      }
    },
    'totalAmount': {
      in: ['body'],
      isFloat: {
        options: { min: 0 },
        errorMessage: 'Total amount must be a number >= 0',
      }
    },
    'deliveryAddress.address': {
      in: ['body'],
      notEmpty: {
        errorMessage: 'Address is required',
      }
    },
    'deliveryAddress.pinCode': {
      in: ['body'],
      notEmpty: {
        errorMessage: 'Pin code is required',
      }
    },
    'deliveryAddress.city': {
      in: ['body'],
      notEmpty: {
        errorMessage: 'City is required',
      }
    },
    'deliveryAddress.state': {
      in: ['body'],
      notEmpty: {
        errorMessage: 'State is required',
      }
    },
    'deliveryAddress.country': {
      in: ['body'],
      notEmpty: {
        errorMessage: 'Country is required',
      }
    },
    'deliveryAddress.coordinates': {
      in: ['body'],
      isArray: {
        options: { min: 2, max: 2 },
        errorMessage: 'Coordinates must be an array [longitude, latitude]',
      }
    },
    'deliveryAddress.coordinates.*': {
      in: ['body'],
      isFloat: {
        errorMessage: 'Coordinates must be valid numbers',
      }
    },
    'restaurantLocation.type': {
      optional: true,
      equals: {
        options: ['Point'],
        errorMessage: 'restaurantLocation.type must be "Point"',
      }
    },
    'restaurantLocation.coordinates': {
      in: ['body'],
      isArray: {
        options: { min: 2, max: 2 },
        errorMessage: 'Restaurant coordinates must be [longitude, latitude]',
      }
    },
    'restaurantLocation.coordinates.*': {
      in: ['body'],
      isFloat: {
        errorMessage: 'Restaurant coordinates must be numbers',
      }
    }
  }),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const [err] = errors.array()
      return next(new ErrorHandler(err.msg, 400))
    }
    next()
  }
]


export default validateOrder