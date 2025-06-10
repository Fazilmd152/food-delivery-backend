import exprees from 'express'
import isAuthenticate from '../middlewares/isAuthenticate.js'
const route = exprees.Router()
import { addFood, addFoodToMenu, addMenu, deleteFoodItem, deleteMenu, getAllFoodItems, getAllMenus, getSingleMenu, removeFoodFromMenu, updateFoodItem, updateMenu } from '../controllers/menuAndFoodController.js'
import MenuAFoodBodyValidation from '../libs/menuAFoodBodyValidation.js'
import Authorization from '../libs/Authourization.js'

const { addMenuBodyVal,addFoodBodyVal,updateBodyVal } = new MenuAFoodBodyValidation()
const {  admin,restaurant} = new Authorization()

route.post('/add', isAuthenticate,restaurant,addMenuBodyVal(),addMenu )
route.post('/food/add/:menuId', isAuthenticate,restaurant,addFoodBodyVal(),addFood)
route.get('/all', isAuthenticate,admin,getAllMenus)
route.get('/:menuId', isAuthenticate,getSingleMenu)
route.get('/food/all', isAuthenticate,getAllFoodItems)
route.get('/food/:foodId', isAuthenticate,getAllFoodItems)
route.put('/update/:menuId', isAuthenticate,restaurant,updateBodyVal(),updateMenu)
route.put('/food/update/:foodId', isAuthenticate,restaurant,updateBodyVal(),updateFoodItem)
route.delete('/delete/:menuId', isAuthenticate,restaurant,deleteMenu)
route.delete('/food/delete/:foodId', isAuthenticate,restaurant,deleteFoodItem)
route.put('/food/add/:menuId/:foodId', isAuthenticate,restaurant,addFoodToMenu)
route.delete('/food/remove/:menuId/:foodId', isAuthenticate,restaurant,removeFoodFromMenu)

export default route