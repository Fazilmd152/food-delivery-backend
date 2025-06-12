import { config } from "dotenv"
import  deliveryPersonDummyData from '../database/dummy_data/dummydeliveryPersonData.json'assert { type: "json" }
import DeliveryPerson from "../models/deliveryPersonModel.js"
import connectDb from '../database/connectDb.js'
config()
await connectDb()

async function seeder(){
   await DeliveryPerson.deleteMany()
   console.log("Deleted Successfully")

   await DeliveryPerson.insertMany(deliveryPersonDummyData)
   console.log("data insertedin db succesfully")

   process.exit()
}

seeder()