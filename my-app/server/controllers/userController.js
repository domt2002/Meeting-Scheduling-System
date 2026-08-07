const bcrypt = require('bcrypt')
const user = require('../models/user')

async function createUser(req, res) {
    console.log('createUser payload:', req.body)

    try {
        const { firstName, lastName, email, password } = req.body
        const passwordHash = await bcrypt.hash(password, 10)

        const newUser = await user.create({
            firstName,
            lastName,
            email,
            passwordHash
        })

        res.status(201).json({
            id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email
        })
    } catch (e) {
        console.error('createUser error:', e)
        if (e.code === 11000) {
            return res.status(409).json({ message: 'Email already registered' })
        }
        res.status(500).json({ message: e.message })
    }
}

module.exports = {
    createUser
}
