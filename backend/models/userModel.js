import { DataTypes } from "sequelize";
import db from "../database/db.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const UserModel = db.define(
    "user",
    {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(25),
            allowNull: false,
            unique: {
                name: "unique_email",
                msg: "This email is already registered, please provide a valid one"
            },
            validate: {
                isEmail: {
                    msg: "Invalid email format. Provide valid one "
                }
            }
        },
        password: {
            type: DataTypes.STRING(350),
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(13),
            allowNull: false,
            unique: {
                name: "unique_phone",
                msg: "This phone number is already registered, please provide a different one."
            }
        },
        image_url: {
            type: DataTypes.STRING(250),
            allowNull: true,
        },
        role: {
            type: DataTypes.STRING(10),
            defaultValue: "user"
        },
        otp: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        otpDetails: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false // e.g., user inactive until verified
        },
        otpExpiry: {
            type: DataTypes.DATE,
            allowNull: true
        },
        latitude: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        longitude: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
            resetPasswordToken: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: null,
        },
        resetPasswordExpire: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        }
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeCreate: async (user, options) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(11)
                    user.password = await bcrypt.hash(user.password, salt)
                }
            },
            beforeUpdate: async (user, options) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(11)
                    user.password = await bcrypt.hash(user.password, salt)
                }
            }
        }
    })

//validate password
UserModel.prototype.isValidPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

//jwt token
UserModel.prototype.getJwtToken = function () {
    return jwt.sign(
        { id: this.user_id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_TIME }
    )
}

//reset password token
UserModel.prototype.getResetPasswordToken = function () {
   const token=crypto.randomBytes(20).toString('hex');
   this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
   //set expire time    
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    return token
}

export default UserModel
