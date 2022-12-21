require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const listRoute = require('./routes/qna_list')
const customerRoute = require('./routes/customer')
const userRoute = require('./routes/user')
const errorHandler = require('./middleware/errorMiddleware')


const app = express()

//middlewares
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(cors())


//routes
app.use('/api',listRoute)
app.use('/api',customerRoute)
app.use('/api',userRoute)


app.use(errorHandler)

const port = process.env.PORT||8000;
app.listen(port,()=>{
    console.log(`listening on port:${port}`)
});