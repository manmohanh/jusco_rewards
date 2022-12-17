require('dotenv').config();
const express = require('express');
const listRoutes = require('./routes/qna_list');
const customerRoutes = require('./routes/customer');


const app = express();
app.use(express.json({extended:true}));
app.use('/api',listRoutes);
app.use('/api',customerRoutes);

const port = process.env.PORT||8000;
app.listen(port,()=>{
    console.log(`listening on port:${port}`)
})