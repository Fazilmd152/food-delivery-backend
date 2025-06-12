import express from 'express'
import isAuthenticate from '../middlewares/isAuthenticate.js'
import { addFood, addFoodToMenu, addMenu, deleteFoodItem, deleteMenu, getAllFoodItems, getAllMenus, getSingleMenu, removeFoodFromMenu, updateFoodItem, updateMenu } from '../controllers/menuAndFoodController.js'
import Authorization from '../authourize/Authourization.js'
import UniqueValidation from '../validations/uniqueValidation.js'
import { addReview, deleteReview, getAllReviews, getReviewById, updateReview } from '../controllers/reviewController.js'


const route = express.Router()

//validation and authorization class instance
//const cmnVal = new CommonValidation()
const uniVal = new UniqueValidation()
const authorize = new Authorization()

route.post('/add/:restaurantId', isAuthenticate, authorize.restaurant, uniVal.addFoodVal, addMenu)
    .post('/food/add/:menuId', isAuthenticate, authorize.restaurant, uniVal.addFoodVal, addFood)
    .get('/all', isAuthenticate, getAllMenus)
    .get('/:menuId', isAuthenticate, getSingleMenu)
    .get('/food/all', isAuthenticate, getAllFoodItems)
    .get('/food/:foodId', isAuthenticate, getAllFoodItems)
    .put('/update/:menuId', isAuthenticate, authorize.restaurant, uniVal.foodUpdateVal, updateMenu)
    .put('/food/update/:foodId', isAuthenticate, authorize.restaurant, uniVal.foodUpdateVal, updateFoodItem)
    .delete('/delete/:menuId', isAuthenticate, authorize.restaurant, deleteMenu)
    .delete('/food/delete/:foodId', isAuthenticate, authorize.restaurant, deleteFoodItem)
    .put('/food/add/:menuId/:foodId', isAuthenticate, authorize.restaurant, addFoodToMenu)
    .delete('/food/remove/:menuId/:foodId', isAuthenticate, authorize.restaurant, removeFoodFromMenu)
    .post('/food/review/add', isAuthenticate, authorize.user, uniVal.addReviewVal, addReview)
    .put('/food/review/update/:id', isAuthenticate, authorize.user, uniVal.updateReviewVal, updateReview)
    .get('/food/review/:id', isAuthenticate, getReviewById)
    .get('/food/review/all/:id', isAuthenticate, getAllReviews)
    .delete('/food/review/delete/:id', isAuthenticate, authorize.user, deleteReview)

export default route