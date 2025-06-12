import FoodModel from "../models/foodModel.js";
import MenuModel from "../models/menuModel.js";
import asyncError from "../utils/asyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import MenuAndFoodApiFeatures from "../utils/MenuandFoodApiFeatures.js";


/**** 
Add a new menu - (/api/restaurant/menu/add/:restaurantId)
****/
export const addMenu = asyncError(async (req, res, next) => {
    const {  description, type } = req.body
    const {restaurantId}=req.params
    const menu = await MenuModel.create({
        restaurantId,
        description,
        type,
        isAvailable: true // Default to available
    })

    if (!menu)
        return next(new ErrorHandler("Failed to create menu", 500));
    // If menu created successfully, return the menu details
    res.status(201).json({
        success: true,
        message: "Menu added successfully",
        menu
    })
})


/**** 
Add a food - (/api/restaurant/menu/food/add/:menuId)
****/
export const addFood = asyncError(async (req, res, next) => {
    const { menuId } = req.params
    const menu = await MenuModel.findById(menuId)
    if (!menu)
        return next(new ErrorHandler("Menu not found", 404))

    const { name, description, price, categories, image_url, tags, ingredients } = req.body
    const food = await FoodModel.create({
        restaurantId: menu.restaurantId.toString(),
        name, description, price, categories,
        image_url, tags, ingredients
    })
    if (!food)
        return next(new ErrorHandler("Failed to create food item", 500))

    // Add food to the menu
    menu.menuItems.push(food._id)
    await menu.save()

    res.status(200).json({
        success: true,
        message: "Food added to menu successfully",
        menu,
        food
    })
})

/****
Get all menus - (/api/restaurant/menu/all)  
****/
export const getAllMenus = asyncError(async (req, res, next) => {
    const totalMenus = await MenuModel.countDocuments()
    const apiFeature = new MenuAndFoodApiFeatures(MenuModel, req.query).filter()
    const filteredMenusCount = await apiFeature.query.clone().countDocuments()
    apiFeature.paginate()
    const menus = await apiFeature.query

    if (!menus || menus.length === 0)
        return next(new ErrorHandler("No menus found", 404))

    res.status(200).json({
        success: true,
        totalMenus,
        filteredMenusCount,
        message: "Menus retrieved successfully",
        menus
    })
})


/****
Get a single menu by ID - (/api/restaurant/menu/:menuId)    
****/
export const getSingleMenu = asyncError(async (req, res, next) => {
    const { menuId } = req.params
    const menu = await MenuModel.findById(menuId).populate("menuItems")

    if (!menu)
        return next(new ErrorHandler("Menu not found", 404))

    res.status(200).json({
        success: true,
        message: "Menu retrieved successfully",
        menu
    })
})


/****
Update a menu - (/api/restaurant/menu/update/:menuId)       
****/
export const updateMenu = asyncError(async (req, res, next) => {
    const { _id } = req.restaurant
    const { menuId } = req.params
    const { description, type, isAvailable } = req.body

    const menu = await MenuModel.findById(menuId)

    // Check if the menu belongs to the restaurant
    if (menu.restaurantId.toString() !== _id.toString())
        return next(new ErrorHandler("You are not authorized to update this menu", 403))
    if (!menu)
        return next(new ErrorHandler("Menu not found", 404))
    // Update menu details
    menu.description = description || menu.description
    menu.type = type || menu.type
    menu.isAvailable = isAvailable !== undefined ? isAvailable : menu.isAvailable
    await menu.save()
    res.status(200).json({
        success: true,
        message: "Menu updated successfully",
        menu
    })
})

/****
Delete a menu - (/api/restaurant/menu/delete/:menuId)   
****/
export const deleteMenu = asyncError(async (req, res, next) => {
    const { _id } = req.restaurant
    const { menuId } = req.params
    const menu = await MenuModel.findById(menuId)
    // Check if the menu belongs to the restaurant
    if (menu.restaurantId.toString() !== _id.toString())
        return next(new ErrorHandler("You are not authorized to delete this menu", 403))
    if (!menu)
        return next(new ErrorHandler("Menu not found", 404))

    // Delete all food items associated with this menu
    await FoodModel.deleteMany({ _id: { $in: menu.menuItems } })

    // Delete the menu itself
    await MenuModel.findByIdAndDelete(menuId)

    res.status(200).json({
        success: true,
        message: "Menu  deleted successfully"
    })
})


/****
 get all food items  - (/api/restaurant/menu/food/all)
****/
export const getAllFoodItems = asyncError(async (req, res, next) => {
    const totalFoodItems = await FoodModel.countDocuments()
    const apiFeature = new MenuAndFoodApiFeatures(FoodModel, req.query).search().filter()
    const filteredFoodCount = await apiFeature.query.clone().countDocuments()
    apiFeature.paginate()
    const foodItems = await apiFeature.query.populate("restaurantId", "name address location is_open")

    if (!foodItems || foodItems.length === 0)
        return next(new ErrorHandler("No food items found", 404))

    res.status(200).json({
        success: true,
        totalFoodItems,
        filteredFoodCount,
        message: "Food items retrieved successfully",
        foodItems
    })
})

/****
  Get a single food item by ID - (/api/restaurant/menu/food/:foodId)
****/
export const getSingleFoodItem = asyncError(async (req, res, next) => {
    const { foodId } = req.params
    const foodItem = await FoodModel.findById(foodId).populate("restaurantId", "name address location is_open")

    if (!foodItem)
        return next(new ErrorHandler("Food item not found", 404))

    res.status(200).json({
        success: true,
        message: "Food item retrieved successfully",
        foodItem
    })
})

/****
Update a food item - (/api/restaurant/menu/food/update/:foodId)
****/
export const updateFoodItem = asyncError(async (req, res, next) => {
    const { _id } = req.restaurant
    const { foodId } = req.params
    const { name, description, price, categories, image_url, tags, ingredients } = req.body

    const foodItem = await FoodModel.findById(foodId)
    // Check if the food item belongs to the restaurant
    if (foodItem.restaurantId.toString() !== _id.toString())
        return next(new ErrorHandler("You are not authorized to update this food item", 403))
    if (!foodItem)
        return next(new ErrorHandler("Food item not found", 404))

    // Update food item details
    foodItem.name = name || foodItem.name
    foodItem.description = description || foodItem.description
    foodItem.price = price || foodItem.price
    foodItem.categories = categories || foodItem.categories
    foodItem.image_url = image_url || foodItem.image_url
    foodItem.tags = tags || foodItem.tags
    foodItem.ingredients = ingredients || foodItem.ingredients

    await foodItem.save()

    res.status(200).json({
        success: true,
        message: "Food item updated successfully",
        foodItem
    })
})

/****
Delete a food item - (/api/restaurant/menu/food/delete/:foodId)
*****/
export const deleteFoodItem = asyncError(async (req, res, next) => {
    const { _id } = req.restaurant
    const { foodId } = req.params
    const foodItem = await FoodModel.findById(foodId)
    // Check if the food item belongs to the restaurant
    if (foodItem.restaurantId.toString() !== _id.toString())
        return next(new ErrorHandler("You are not authorized to delete this food item", 403))
    if (!foodItem)
        return next(new ErrorHandler("Food item not found", 404))

    // Remove food item from the menu
    const menu = await MenuModel.findOne({ menuItems: foodId })
    if (menu) {
        menu.menuItems.pull(foodId)
        await menu.save()
    }

    // Delete the food item
    await FoodModel.findByIdAndDelete(foodId)

    res.status(200).json({
        success: true,
        message: "Food item deleted successfully"
    })
})

/****
add food to menu - (/api/restaurant/menu/food/add/:menuId/:foodId)
****/
export const addFoodToMenu = asyncError(async (req, res, next) => {
    const { _id } = req.restaurant
    const { menuId, foodId } = req.params
    const menu = await MenuModel.findById(menuId)
    if (!menu)
        return next(new ErrorHandler("Menu not found", 404))

    const foodItem = await FoodModel.findById(foodId)
    // Check if the food item belongs to the restaurant
    if (foodItem.restaurantId.toString() !== _id.toString() &&
        menu.restaurantId.toString() !== _id.toString()) {
        return next(new ErrorHandler("You are not authorized to add this food item to the menu", 403))
    }
    if (!foodItem)
        return next(new ErrorHandler("Food item not found", 404))
    // Check if food item is already in the menu
    if (menu.menuItems.includes(foodId))
        return next(new ErrorHandler("Food item already exists in this menu", 400))

    // Add food item to the menu
    menu.menuItems.push(foodId)

    await menu.save()
    res.status(200).json({
        success: true,
        message: "Food item added to menu successfully",
        menu
    })
})

/****
remove food from menu - (/api/restaurant/menu/food/remove/:menuId/:foodId)
****/
export const removeFoodFromMenu = asyncError(async (req, res, next) => {
    const { _id } = req.restaurant
    const { menuId, foodId } = req.params
    const menu = await MenuModel.findById(menuId)
    // Check if the menu belongs to the restaurant
    if (menu.restaurantId.toString() !== _id.toString())
        return next(new ErrorHandler("You are not authorized to remove food from this menu", 403))
    if (!menu)
        return next(new ErrorHandler("Menu not found", 404))
    // Check if food item is in the menu
    if (!menu.menuItems.includes(foodId))
        return next(new ErrorHandler("Food item not found in this menu", 404))
    // Remove food item from the menu
    menu.menuItems.pull(foodId)
    await menu.save()
    res.status(200).json({
        success: true,
        message: "Food item removed from menu successfully",
        menu
    })
})