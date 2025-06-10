import crypto from 'crypto'
import sendEmail from './sendEmail.js'

class ApiFeatures {
    constructor() {}
    

    getOtp(length) {
        if (length === 4) {
            const otp = crypto.randomInt(1000, 9999)
            return otp
        } else {
            const otp = crypto.randomInt(100000, 999999)
            return otp
        }
    }


    async sendOtp(email, otp) {
        const emailStatus = await sendEmail({
            email: email,
            subject: 'Your OTP code',
            message: `Your Otp code is ${otp}`
        })

        if (emailStatus.status === "Success")
            return true
        else return false
    }
}

export default ApiFeatures





