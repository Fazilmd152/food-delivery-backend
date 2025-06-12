import { config } from "dotenv"
import deliveryPersonDummyData from '../database/dummy_data/dummydeliveryPersonData.json' assert { type: "json" }
import restaurantDummyData from '../database/dummy_data/dummyRestaurantData.json' assert { type: "json" }
import foodDummyData from '../database/dummy_data/foodData.json' assert { type: "json" }
import DeliveryPerson from "../models/deliveryPersonModel.js"
import connectDb from '../database/connectDb.js'
import FoodModel from "../models/foodModel.js"
import RestModel from "../models/restaurantModel.js"

config();
await connectDb();

const models = [
  { model: RestModel, data: restaurantDummyData },
  { model: FoodModel, data: foodDummyData },
  { model: DeliveryPerson, data: deliveryPersonDummyData },
]

async function seeder() {
  try {
    for (const { model, data } of models) {
      await model.deleteMany()
      console.log(`Deleted data from ${model.modelName} collection`)

      await model.insertMany(data);
      console.log(`Inserted data into ${model.modelName} collection`)
    }

    process.exit()
  } catch (error) {
    console.error(error)
    process.exit(1) // Exit with a non-zero status code to indicate failure
  }
}

seeder()
