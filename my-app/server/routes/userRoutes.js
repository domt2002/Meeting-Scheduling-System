const express = require('express')
const router = express.Router()
const { createUser, loginUser, createAdminUser, getUsers, getUserById, updateUser, decodeAuth } = require('../controllers/userController')

router.post('/', createUser)
router.post('/login', loginUser)
router.post('/admin', createAdminUser)
router.get('/', getUsers)
router.get('/:id', decodeAuth, getUserById)
router.put('/:id', decodeAuth, updateUser)

module.exports = router
