import {config} from 'dotenv'
config()

export default {
  development: {
    username: "root",
    password: "F@zilsql",
    database: "food_delivery",
    host: "127.0.0.1",
    dialect: "mysql" 
  },
  test: {
    username: "root",
    password: null,
    database: "test_db",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql"
  }
}
