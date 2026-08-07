const express = require('express')
const router = express.Router()
const { createUser, loginUser, createAdminUser } = require('../controllers/userController')

router.post('/', createUser)
router.post('/login', loginUser)
router.post('/admin', createAdminUser)

module.exports = router
