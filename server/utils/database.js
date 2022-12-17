const { createConnection } = require('mysql');

const con = createConnection({
    host:"localhost",
    user:"rewards",
    password:"rewards",
    database:"rewards"

})

con.connect((err)=>{
    if(err){
        console.log(err);
    }
});

module.exports = con;
