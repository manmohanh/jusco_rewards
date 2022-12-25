const router = require('express').Router();
const {read} = require('../controllers/qna_list');
const { requireSignIn } = require('../middleware/authMiddleware')

router.get('/read',read)

module.exports = router;