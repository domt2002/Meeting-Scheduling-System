const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const user = require('../models/user')

function adminRequest(req) {
    const roleHeader = req.headers['userrole']
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

        const token = jwt.sign(
            {
                "id": existingUser._id,
                "role": existingUser.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h',
            }
        )

        res.json({
            token: token,
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

async function decodeAuth(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing token' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (e) {
        return res.status(401).json({ message: 'Invalid token' })
    }
}

async function getUserById(req, res) {
    const { id } = req.params
    try {
        const existingUser = await user.findById(id)
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' })
        }

        const requesterId = req.headers['userid']
        const roleHeader = req.headers['userrole']
        if (requesterId !== id && roleHeader !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' })
        }

        res.json({
            id: existingUser._id,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            email: existingUser.email,
            role: existingUser.role,
            billingAddress: existingUser.billingAddress || '',
            creditCardNumber: existingUser.creditCardNumber || '',
            expirationDate: existingUser.expirationDate || '',
            cvv: existingUser.cvv || ''
        })
    } catch (e) {
        console.error('getUserById error:', e)
        res.status(500).json({ message: e.message })
    }
}

async function getUsers(req, res) {
    const { email, id } = req.query
    try {
        if (!email && !id) {
            return res.status(400).json({ message: 'Query parameter email or id is required' })
        }

        const query = {}
        if (id) query._id = id
        if (email) query.email = email

        const existingUser = await user.findOne(query)
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' })
        }

        const requesterId = req.headers['userid']
        const roleHeader = req.headers['userrole']
        if (requesterId !== String(existingUser._id) && roleHeader !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' })
        }

        res.json({
            id: existingUser._id,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            email: existingUser.email,
            role: existingUser.role,
            billingAddress: existingUser.billingAddress || '',
            creditCardNumber: existingUser.creditCardNumber || '',
            expirationDate: existingUser.expirationDate || '',
            cvv: existingUser.cvv || ''
        })
    } catch (e) {
        console.error('getUsers error:', e)
        res.status(500).json({ message: e.message })
    }
}

async function updateUser(req, res) {
    const { id } = req.params
    const { firstName, lastName, email, password, billingAddress, creditCardNumber, expirationDate, cvv } = req.body

    const requesterId = req.headers['userid']
    const roleHeader = req.headers['userrole']
    if (requesterId !== id && roleHeader !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' })
    }

    try {
        const existingUser = await user.findById(id)
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (firstName !== undefined) existingUser.firstName = firstName
        if (lastName !== undefined) existingUser.lastName = lastName
        if (email !== undefined) existingUser.email = email
        if (password) {
            existingUser.passwordHash = await bcrypt.hash(password, 10)
        }
        if (billingAddress !== undefined) existingUser.billingAddress = billingAddress
        if (creditCardNumber !== undefined) existingUser.creditCardNumber = creditCardNumber
        if (expirationDate !== undefined) existingUser.expirationDate = expirationDate
        if (cvv !== undefined) existingUser.cvv = cvv

        const updatedUser = await existingUser.save()
        res.json({
            id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            role: updatedUser.role,
            billingAddress: updatedUser.billingAddress || '',
            creditCardNumber: updatedUser.creditCardNumber || '',
            expirationDate: updatedUser.expirationDate || '',
            cvv: updatedUser.cvv || '',
            message: 'Profile updated successfully'
        })
    } catch (e) {
        console.error('updateUser error:', e)
        if (e.code === 11000) {
            return res.status(409).json({ message: 'Email already registered' })
        }
        res.status(500).json({ message: e.message })
    }
}

async function getClientsWithBilling(req, res) {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin privileges required' })
        }

        const clients = await user.find({
            role: 'client',
            billingAddress: { $ne: '' },
            creditCardNumber: { $ne: '' },
            expirationDate: { $ne: '' },
            cvv: { $ne: '' }
        }).select('firstName lastName email')

        const result = clients.map(c => ({ id: c._id, firstName: c.firstName, lastName: c.lastName, email: c.email }))
        res.json(result)
    } catch (e) {
        console.error('getClientsWithBilling error:', e)
        res.status(500).json({ message: e.message })
    }
}

module.exports = {
    createUser,
    loginUser,
    createAdminUser,
    getUsers,
    getUserById,
    getClientsWithBilling,
    updateUser,
    decodeAuth
}
