import express from 'express'
import {config} from 'dotenv'
import errorMiddleware from './middlewares/error.js'
import adminRoute from "./routes/adminRoute.js"
import userRoute from "./routes/userRoute.js"
import restaurantRoute from "./routes/restaurantRoute.js"
import menuAndFoodRoute from "./routes/menuAndfoodRoute.js"
import deliveryPersonRoute from "./routes/deliveryPersonRoute.js"
import orderRoute from "./routes/orderRoutes.js"
import connectDb from './database/connectDb.js'
import cookieParser from 'cookie-parser'
config()
connectDb()

const app=express()
app.use(express.json())
app.use(cookieParser())

//routes
app.use("/api/admin",adminRoute)
app.use("/api/user",userRoute)
app.use("/api/restaurant",restaurantRoute)
app.use("/api/restaurant/menu",menuAndFoodRoute)
app.use("/api/deliveryperson",deliveryPersonRoute)
app.use("/api/order",orderRoute)



//middlewares
app.use(errorMiddleware)

app.listen(process.env.PORT,()=>{
    console.log(`${process.env.NODE_ENV} server started successfully on port ${process.env.PORT}` )
})