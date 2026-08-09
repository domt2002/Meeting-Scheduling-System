const express = require('express')
const router = express.Router()
const { createUser, loginUser, createAdminUser, getUsers, getUserById, updateUser } = require('../controllers/userController')

router.post('/', createUser)
router.post('/login', loginUser)
router.post('/admin', createAdminUser)
router.get('/', getUsers)
router.get('/:id', getUserById)
router.put('/:id', updateUser)

module.exports = router
