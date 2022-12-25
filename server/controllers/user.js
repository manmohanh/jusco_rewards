const asyncHandler = require('express-async-handler')
const db = require('../utils/database')
const bcrypt = require('bcryptjs')
const {generateToken} = require('../utils/jwt')
const { sendEmail } = require('../utils/sendEmail')


//register user

exports.register = asyncHandler( async (req,res) => {
    let {
        user_role,
        username,
        name,
        mobile,
        email,
        password 
    } = req.body

        if(!username){
            res.status(400) 
            throw new Error("Username can not be empty")
        }
        if(!name){
            res.status(400) 
            throw new Error("Name can not be empty")
        }
        if(!mobile){
            res.status(400) 
            throw new Error("Mobile can not be empty")
        }
        if(!email){
            res.status(400) 
            throw new Error("Email can not be empty")
        }

        if(password.length<6){
            res.status(400) 
            throw new Error("password must be up to 6 characters.") 
        }
    
        const query1 = `SELECT username FROM metadata_users WHERE username='${username}'`
        const userExist = await new Promise((resolve,reject) => {
            db.query(query1,(error,result) => {
                if(error) reject(error)
                resolve(result)
            })
        })

        if(!userExist.length<1){
            res.status(400) 
            throw new Error("username is already taken")
        }

        const token = generateToken(username)

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        password = hashedPassword

        const query2 = `INSERT INTO metadata_users(user_role,username,name,mobile,email,password,token)
         VALUES(${user_role},'${username}','${name}','${mobile}','${email}','${password}','${token}')`
         await db.query(query2,(err,result)=>{
            if(err) throw err
            res.status(201).json({
               username,name,token 
            })
         })
        res.cookie("token",token,{
            path:"/",
            httpOnly:true,
            expires:new Date(Date.now() + 1000 * 86400), //1day
            sameSite:"none",
            secure:true
        })
})

//Login User
exports.login = asyncHandler( async (req,res) => {
    const { username, password } = req.body

    if(!username || !password){
        res.status(400)
        throw new Error("Please fill username and password")
    }

    
    const query1 = `SELECT username,password,user_role,status FROM metadata_users WHERE username='${username}'`
    const user = await new Promise((resolve,reject) =>{
        db.query(query1,(err,result)=>{
            if(err) reject(err)
            resolve(result)
        })
    })

    if(user.length<1){
        res.status(400)
        throw new Error("Invalid username or password")
    }
    const user_name = user[0].username
    const user_role = user[0].user_role
    const correctPassword = await bcrypt.compare(password,user[0].password)
    if(!correctPassword){
        res.status(400)
        throw new Error("Invalid username or password")
    }

    const token = generateToken(user_name)

    const user_status = await new Promise((resolve,reject) => {
        db.query(`SELECT status FROM metadata_users WHERE username='${username}'`,
        (err,result) => {
            if(err)reject(err)
            resolve(result)
        })
    })

    if(user_status[0].status === "YES"){
        if(user_name && correctPassword){
            res.cookie("token",token,{
                path:"/",
                httpOnly:true,
                expires:new Date(Date.now() + 1000 * 86400), //1day
                sameSite:"none",
                secure:false
            })
            res.status(200).json({
                user_role,username,token
            })
        }else{
            res.status(500)
            throw new Error("Something Went Wrong") 
        }
    }else{
        res.status(400).json({
            message:"User is disable"
        })
    }
})

//get users
exports.users = asyncHandler( async (req,res) => {
    const query = `SELECT * FROM metadata_users`
    const users = await new Promise((resolve,reject) => {
        db.query(query,
            (err,result) => {
                if(err) reject(err)
                resolve(result)
            })
    })
    if(users){
        res.status(200).json(users)
    }else{
        return res.status(500).json({
            message:"Something Went Wrong"
        })
    }
})

//update user's status
exports.update_user_status = asyncHandler( async (req,res) => {
    const user_id = req.params.user_id
    const user_status = await new Promise((resolve,reject) => {
        db.query(`SELECT status FROM metadata_users WHERE id='${user_id}'`,
        (err,result) => {
            if(err) reject(err)
            resolve(result)
        })
    })

    if(user_status[0].status === "YES"){
        const query = `UPDATE metadata_users SET status = "NO" WHERE id='${user_id}'`
        await new Promise((resolve,reject) => {
            db.query(query,(err,result) => {
                if(err) reject(err)
                resolve(result)
            })
        })
        res.send({
            status:"Disabled",
        })

    }else{
        const query = `UPDATE metadata_users SET status = "YES" WHERE id='${user_id}'`
        await new Promise((resolve,reject) => {
            db.query(query,(err,result) => {
                if(err) reject(err)
                resolve(result)
            })
        })
        res.send({
            status:"Enabled"
        })

    }
})

//send email
exports.sendEmail = asyncHandler ( async (req,res) => {
    console.log(req.body)
    const {
        subject,
        send_to,
        reply_to,
        template,
        url
    } = req.body

    if(!subject || !send_to || !reply_to || !template){
        res.status(500)
        throw new Error("Missing email parameters")
    }

    //Get User
    const user = await new Promise((resolve,reject) => {
        db.query(`SELECT user_role,username,name FROM metadata_users WHERE email='${send_to}'`,
        (err,result) => {
            if(err) reject(err)
            resolve(result)
        })
    })
    if(!user){
        res.status(404)
        throw new Error("User Not Found")
    }
    const sent_from = process.env.EMAIL_USER
    const name = user[0].name
    const link = `${process.env.FRONTENED_URL}${url}`

    try {

        await sendEmail(
            subject,
            send_to,
            sent_from,
            reply_to,
            template,
            name,
            link
        )
        res.status(200).json({message:"Email Sent"})
        
    } catch (error) {
      res.status(500)
      throw new Error("Email not Sent,please try again")
    }
})


//Logout User
exports.logout = asyncHandler( async (req,res) => {

    res.cookie("token","",{
        path:"/",
        httpOnly:true,
        expires:new Date(0), 
        sameSite:"none",
        secure:false
    })
    res.status(200).json({
        message:"Logout Successful"
    })

})