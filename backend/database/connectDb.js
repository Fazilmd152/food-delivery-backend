import { config } from "dotenv"
import db from "./db.js"
import mongoose from "mongoose"
config()

async function connectDb() {
    try {
        // MySQL connection
        await db.authenticate()
        console.log("\x1b[33m%s\x1b[0m","✅MySQL connection established successfully.")
        await db.sync()
        console.log("\x1b[33m%s\x1b[0m","✅ MySQL database synced successfully.")

        //MongoDB connection
        if (!process.env.MONGO_DB_URL) {
            throw new Error("MongoDB connection string (DB_URL) is not defined.")
        }
        await mongoose.connect(process.env.MONGO_DB_URL)
        console.log("\x1b[33m%s\x1b[0m", `✅ MongoDB connected to ${process.env.MONGO_DB_URL}`)
    } catch (err) {
        console.error("\x1b[31m%s\x1b[0m", `❌ connection error: ${err.message}`)
    }
}

export default connectDb