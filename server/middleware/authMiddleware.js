const jwt = require('jsonwebtoken')
const db = require('../utils/database')
const asyncHandler = require('express-async-handler')

exports.requireSignIn = asyncHandler( async (req,res,next) => {
   
        const token = req.cookies.token
        if(!token){
            res.status(401)
            throw new Error("Unauthorized")  
        }
        const verified = jwt.verify(token,process.env.JWT_SECRET)
        const user = await new Promise((resolve,reject) => {
            db.query(`SELECT user_role,name,username,email FROM metadata_users WHERE username='${verified.username}'`,
            (err,result) => {
                if(err) reject(err)
                resolve(result)
            })
        })
        if(user.length<1){
            res.status(404)
            throw new Error("User Not Found") 
        }
        req.user = user
        next()
})

exports.adminOnly = asyncHandler( async (req,res) => {
    const query = `SELECT user_role FROM metadata_users `
})