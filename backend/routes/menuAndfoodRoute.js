import express from 'express'
import isAuthenticate from '../middlewares/isAuthenticate.js'
import { addFood, addFoodToMenu, addMenu, deleteFoodItem, deleteMenu, getAllFoodItems, getAllMenus, getSingleMenu, removeFoodFromMenu, updateFoodItem, updateMenu } from '../controllers/menuAndFoodController.js'
import Authorization from '../authourize/Authourization.js'
import UniqueValidation from '../validations/uniqueValidation.js'


const route = express.Router()

//validation and authorization class instance
//const cmnVal = new CommonValidation()
const uniVal = new UniqueValidation()
const authorize = new Authorization()

route.post('/add', isAuthenticate,authorize.restaurant,uniVal.addFoodVal,addMenu )
route.post('/food/add/:menuId', isAuthenticate,authorize.restaurant,uniVal.addFoodVal,addFood)
route.get('/all', isAuthenticate,getAllMenus)
route.get('/:menuId', isAuthenticate,getSingleMenu)
route.get('/food/all', isAuthenticate,getAllFoodItems)
route.get('/food/:foodId', isAuthenticate,getAllFoodItems)
route.put('/update/:menuId', isAuthenticate,authorize.restaurant,uniVal.foodUpdateVal,updateMenu)
route.put('/food/update/:foodId', isAuthenticate,authorize.restaurant,uniVal.foodUpdateVal,updateFoodItem)
route.delete('/delete/:menuId', isAuthenticate,authorize.restaurant,deleteMenu)
route.delete('/food/delete/:foodId', isAuthenticate,authorize.restaurant,deleteFoodItem)
route.put('/food/add/:menuId/:foodId', isAuthenticate,authorize.restaurant,addFoodToMenu)
route.delete('/food/remove/:menuId/:foodId', isAuthenticate,authorize.restaurant,removeFoodFromMenu)

export default route