
async function sendCookie(res, admin) {
    const token = await admin.getJwtToken()

    const options = {
        maxAge: process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: 'strict'
    }
    const{password,otp,otpDetails,status,otpExpiry,role,...user}=admin.toJSON()
     if(role==="user"){
        res.status(200).cookie(`${role}Auth`, token, options).json({
        success: true,
        user
    })
    }  

    if(role==='restaurant'){
        const{password,...rest}=admin.toJSON()
        return res.status(200).cookie(`${role}Auth`, token, options).json({
        success: true,
        restaurant:rest
    })
    }

     if(role==='admin'){
        const{password,...rest}=admin.toJSON()
        return res.status(200).cookie(`${role}Auth`, token, options).json({
        success: true,
        admin:rest
    })}

     if(role==='delivery_person'){
        const{password,...rest}=admin.toJSON()
        return res.status(200).cookie(`${role}Auth`, token, options).json({
        success: true,
        delivery_person:rest
    })}
   
    
}

export default sendCookie