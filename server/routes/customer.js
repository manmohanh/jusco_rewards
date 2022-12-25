const router = require('express').Router();
const {create_customer,survey_report,search,view,survey_report_today,survey_report_week,survey_report_month} = require('../controllers/customer');

//create customer
router.post('/create',create_customer);
//reports
router.get('/reports',survey_report);

//search
router.get('/search/:key',search)

router.get('/view/:house_id',view);
router.get('/today',survey_report_today);
router.get('/week',survey_report_week)
router.get('/month',survey_report_month);


module.exports = router;