export default (err, req, res, next) => {
    let statusCode = err.statusCode || 500
    let message = err.message


    if (process.env.NODE_ENV === 'production') {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages[0]
            })
        }
    }
    // if (err.code === "ER_DUP_ENTRY") {
    //     statusCode = 409
    //     message = "Item already exists"
    // }
    //console.log(err)
    if(process.env.NODE_ENV === 'development') {
        res.status(statusCode).json({
        success: false,
        message,
        stack: err.stack
    })
    }
    
}