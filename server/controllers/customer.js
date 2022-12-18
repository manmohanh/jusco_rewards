const db = require('../utils/database');
const fileUpload = require('express-fileupload');
const { format } = require('../utils/database');

//save customer
exports.create = async (req,res) => {
    try {
        const {
            house_id,
            customer_name,
            mobile_no,
            address,
            zone,
            area,
            location,
            latitude,
            longitude,
            feedback,
            qna
        } = req.body;

    const event_id = Math.floor(Math.random()*1000) + new Date().getTime();

    const data = {event_id,house_id,customer_name,mobile_no,address,zone,area,location,latitude,longitude,feedback};
    await db.query('INSERT INTO metadata_customer SET ?',data, (err,result) => {
        if(err){
            return res.status(200).json({
                success:false,
                body:err
            })
        }
        res.json({
            success:true,
            body:result
        })
    });
    
    //
    create_transaction(event_id,qna);
    
    } catch (error) {
        return res.status(400).json({body:error})
    }
};

//report
exports.report = async (req,res) => {
    try {
        await db.query('SELECT metadata_customer.customer_name AS name,metadata_customer.mobile_no AS mobile,transaction_survey.house_id AS house_id,metadata_customer.address AS address,metadata_customer.zone AS zone,metadata_customer.area AS area,metadata_customer.location AS locality,SUM(transaction_survey.marks) AS totalMarks,metadata_customer.feedback AS feedback,transaction_survey.entry_date AS serveyedOn  FROM metadata_customer JOIN transaction_survey ON metadata_customer.house_id=transaction_survey.house_id GROUP BY house_id ORDER BY transaction_survey.entry_date DESC LIMIT 10 OFFSET 0' ,function(err,result){
        if(err) throw err;
        res.status(200).json(result);
       }); 
    } catch (error) {
        console.log(error)
    }
}

exports.view = async (req,res) => {
    let user;
    try {
        await db.query("SELECT metadata_customer.customer_name AS name,metadata_customer.mobile_no AS mobile,transaction_survey.house_id AS house_id,metadata_customer.address AS address,metadata_customer.zone AS zone,metadata_customer.area AS area,metadata_customer.location AS locality,SUM(transaction_survey.marks) AS totalMarks,metadata_customer.feedback AS feedback,transaction_survey.entry_date AS serveyedOn FROM metadata_customer JOIN transaction_survey ON metadata_customer.house_id=transaction_survey.house_id GROUP BY house_id HAVING transaction_survey.house_id="+req.params.house_id,
        (err,result) => {
            user = result;
           }); 
        await db.query("SELECT metadata_qna_list.question AS question,metadata_qna_list.choice AS choice,transaction_survey.marks AS marks FROM metadata_qna_list JOIN transaction_survey ON metadata_qna_list.id = transaction_survey.QnA_id WHERE house_id=" +req.params.house_id,
        (err,result) => {
            res.status(200).json({
                user:user,
                body:result
                });
        })
    } catch (error) {
       console.log(error); 
    }
};
exports.survey_report_today = async (req,res) => {
    try {
        
        let query = `SELECT COUNT(DISTINCT(event_id)) as event FROM transaction_survey WHERE DATE_FORMAT(entry_date,'%Y%m%d') = CURDATE()`

        await db.query(query,function(err,result){
            if(err) {
                console.log(err);
            }
            console.log(result);
            res.status(200).json({
                counts:result
            });
        })
    } catch (error) {
       console.log(error); 
    }
};
exports.survey_report_last_week = async (req,res) => {
    try {

        let query = `SELECT COUNT(DISTINCT(event_id)) AS counts FROM transaction_survey WHERE DATE_FORMAT(entry_date, "%Y%m%d") BETWEEN CURDATE()-7 AND CURDATE()`;

        await db.query(query,function(err,result){
            if(err) {
                console.log(err);
            }
            res.status(200).json({
                result
            });
        })
    } catch (error) {
       console.log(error); 
    }
};

exports.survey_report_month = async (req,res) => {

    try {
        let query = `SELECT COUNT(DISTINCT(event_id)) AS counts FROM transaction_survey WHERE DATE_FORMAT(entry_date, "%Y%m%d") BETWEEN (CURDATE()-(DATE_FORMAT(CURDATE(), "%d")-1)) AND CURDATE()`;
        await db.query(query,function(err,result){
            if(err) {
                console.log(err);
            }
            res.status(200).json({
                result
            });
        })
    } catch (error) {
       console.log(error); 
    }
};




//create transation
async function create_transaction(event_id,qna){
    
    await db.query("SELECT house_id FROM metadata_customer WHERE event_id = ?",event_id,(err,result) => {
        if(err) return false;

        const houseId= result[0].house_id 
      
        for(let i=0;i<qna.length;i++){

            // if (!req.files || Object.keys(req.files).length === 0) {
            //     return res.status(400).send('No files were uploaded.');
            //   }
            //   var file = req.files.image;
            //   var uploadedPath = 'public/image/'+file.name;
            
            //   file.mv(uploadedPath,function(err){
            //     if(err){
            //         return res.status(500).send(err);
            //     }
            //     console.log('File uploaded!');
            //   });
            
            const data = {event_id,house_id:houseId,QnA_id:i+1,marks:qna[i],image:"",entry_by:houseId,entry_date:new Date().toISOString()}
             db.query('INSERT INTO transaction_survey SET ?',data, (err,result) => {
                if(err){
                    return false;
                }
                return true;
            });
    
        }
    });
}