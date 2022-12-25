const db = require('./utils/database')

async function demo(){
    // const query = `SELECT A.id, A.username FROM metadata_users AS A LEFT JOIN transaction_survey AS B ON A.id = B.entry_by GROUP BY B.entry_by`
    // const response = await new Promise((resolve,reject) => {
    // db.query(query,
    //     (err,result) => {
    //         if(err) reject(err)
    //         resolve(result)
    //     })
    // })
    // console.log(response)
    const query = `SELECT * FROM metadata_customer AS A INNER JOIN transaction_survey AS B ON A.event_id = B.event_id WHERE 1 AND zone = 'Baridih' AND B.entry_date BETWEEN CURDATE() AND CURDATE()-7 GROUP BY A.event_id`
    const response = await new Promise((resolve,reject) => {
        db.query(query,
            (err,result) => {
                if(err) reject(err)
                resolve(result)
            })
    })
    console.log(response)
}
demo()

