import db from '../database/db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { DataTypes } from 'sequelize'
import crypto from 'crypto'

const AdminModel = db.define(
    "admin",
    {
        admin_id: {
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
        role: {
            type: DataTypes.STRING(10),
            defaultValue: "admin"
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
    }
    , {
        freezeTableName: true,
        tableName: 'admin',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeCreate: async (admin, options) => {
                if (admin.changed('password')) {
                    const salt = await bcrypt.genSalt(11)
                    admin.password = await bcrypt.hash(admin.password, salt)
                }
            },
            beforeUpdate: async (admin, options) => {
                if (admin.changed('password')) {
                    const salt = await bcrypt.genSalt(11)
                    admin.password = await bcrypt.hash(admin.password, salt)
                }
            },

        }
    }
)

//validate password
AdminModel.prototype.isValidPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

//jwt token
AdminModel.prototype.getJwtToken = function () {
    return jwt.sign(
        { id: this.admin_id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_TIME }
    )
}

//get reset password token
AdminModel.prototype.getResetPasswordToken = function () {
    const token = crypto.randomBytes(20).toString('hex')
    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')
    //set expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000 // 30 minutes
    return token
}

export default AdminModel