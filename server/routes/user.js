const router = require('express').Router()
const { requireSignIn } = require('../middleware/authMiddleware')
const {register,login,users,update_user_status,sendEmail,logout} = require('../controllers/user')

router.post('/register',register);
router.post('/login',login)
router.get('/admin/users',users)
router.get('/admin/update/:user_id',update_user_status)
router.post('/sendEmail',requireSignIn,sendEmail)
router.get('/logout',logout)

module.exports = router;