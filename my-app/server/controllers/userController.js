const bcrypt = require('bcrypt')
const user = require('../models/user')

function adminRequest(req) {
    const roleHeader = req.headers['x-user-role'] || req.headers['x-user-role'.toLowerCase()]
    return roleHeader === 'admin'
}

async function createUser(req, res) {
    console.log('createUser payload:', req.body)

    try {
        const { firstName, lastName, email, password } = req.body
        const passwordHash = await bcrypt.hash(password, 10)

        const newUser = await user.create({
            firstName,
            lastName,
            email,
            passwordHash,
            role: 'client'
        })

        res.status(201).json({
            id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            role: newUser.role
        })
    } catch (e) {
        console.error('createUser error:', e)
        if (e.code === 11000) {
            return res.status(409).json({ message: 'Email already registered' })
        }
        res.status(500).json({ message: e.message })
    }
}

async function createAdminUser(req, res) {
    if (!adminRequest(req)) {
        return res.status(403).json({ message: 'Admin privileges required' })
    }

    console.log('createAdminUser payload:', req.body)

    try {
        const { firstName, lastName, email, password } = req.body
        const passwordHash = await bcrypt.hash(password, 10)

        const newAdmin = await user.create({
            firstName,
            lastName,
            email,
            passwordHash,
            role: 'admin'
        })

        res.status(201).json({
            id: newAdmin._id,
            firstName: newAdmin.firstName,
            lastName: newAdmin.lastName,
            email: newAdmin.email,
            role: newAdmin.role
        })
    } catch (e) {
        console.error('createAdminUser error:', e)
        if (e.code === 11000) {
            return res.status(409).json({ message: 'Email already registered' })
        }
        res.status(500).json({ message: e.message })
    }
}

async function loginUser(req, res) {
    console.log('loginUser payload:', req.body)

    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        const existingUser = await user.findOne({ email })
        if (!existingUser) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const passwordMatches = await bcrypt.compare(password, existingUser.passwordHash)
        if (!passwordMatches) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        res.json({
            id: existingUser._id,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            email: existingUser.email,
            role: existingUser.role,
            message: 'Login successful'
        })
    } catch (e) {
        console.error('loginUser error:', e)
        res.status(500).json({ message: e.message })
    }
}

module.exports = {
    createUser,
    loginUser,
    createAdminUser
}
