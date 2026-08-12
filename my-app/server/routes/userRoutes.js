const express = require('express')
const router = express.Router()
const { createUser, loginUser, createAdminUser, getUsers, getUserById, updateUser, decodeAuth, getClientsWithBilling } = require('../controllers/userController')

router.post('/', createUser)
router.post('/login', loginUser)
router.post('/admin', decodeAuth, createAdminUser)
router.get('/', getUsers)
router.get('/billing/filled', decodeAuth, getClientsWithBilling)
router.get('/:id', decodeAuth, getUserById)
router.put('/:id', decodeAuth, updateUser)

module.exports = router
