const request = require('supertest')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const app = require('../app')
const user = require('../models/user')

describe('Auth and users', () => {
    test('registers a new client user without returning password data', async () => {
        const res = await request(app)
            .post('/users')
            .send({
                firstName: 'TesterFirst',
                lastName: 'TesterLast',
                email: 'test@example.com',
                password: 'pass1234'
            })

        expect(res.status).toBe(201)
        expect(res.body.firstName).toBe('TesterFirst')
        expect(res.body.lastName).toBe('TesterLast')
        expect(res.body.email).toBe('test@example.com')
        expect(res.body.role).toBe('client')
        expect(res.body.password).toBeUndefined()
        expect(res.body.passwordHash).toBeUndefined()
    })

    test('rejects duplicate email registration', async () => {
        await request(app)
            .post('/users')
            .send({
                firstName: 'TesterFirst',
                lastName: 'TesterLast',
                email: 'test@example.com',
                password: 'pass1234'
            })

        const res = await request(app)
            .post('/users')
            .send({
                firstName: 'Duplicate',
                lastName: 'user',
                email: 'test@example.com',
                password: 'pass1234'
            })

        expect(res.status).toBe(409)
        expect(res.body.message).toBe('Email already registered')
    })

    test('logs in and returns a JWT token with client role', async () => {
        const registerRes = await request(app)
            .post('/users')
            .send({
                firstName: 'TesterFirst',
                lastName: 'TesterLast',
                email: 'test@example.com',
                password: 'pass1234'
            })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'test@example.com',
                password: 'pass1234'
            })

        expect(registerRes.status).toBe(201)
        expect(loginRes.status).toBe(200)
        expect(loginRes.body.token).toBeDefined()
        expect(loginRes.body.email).toBe('test@example.com')
        expect(loginRes.body.message).toBe('Login successful')

        const decoded = jwt.verify(loginRes.body.token, process.env.JWT_SECRET)
        expect(decoded.id).toBeDefined()
        expect(decoded.role).toBe('client')
    })

    test('rejects login with wrong password', async () => {
        await request(app)
            .post('/users')
            .send({
                firstName: 'TesterFirst',
                lastName: 'TesterLast',
                email: 'test@example.com',
                password: 'pass1234'
            })

        const res = await request(app)
            .post('/users/login')
            .send({
                email: 'test@example.com',
                password: 'wrongpass'
            })

        expect(res.status).toBe(401)
        expect(res.body.message).toBe('Invalid email or password')
    })

    test('rejects login with missing credentials', async () => {
        const res = await request(app)
            .post('/users/login')
            .send({ email: 'test@example.com' })

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Email and password are required')
    })

    test('admins can create other admins', async () => {
        const passwordHash = await bcrypt.hash('adminpass123', 10)

        await user.create({
            firstName: 'AdminFirst',
            lastName: 'AdminLast',
            email: 'testAdmin@example.com',
            passwordHash,
            role: 'admin'
        })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'testAdmin@example.com',
                password: 'adminpass123'
            })

        const res = await request(app)
            .post('/users/admin')
            .set('Authorization', `Bearer ${loginRes.body.token}`)
            .send({
                firstName: 'NewAdmin',
                lastName: 'SecondAdmin',
                email: 'admin@example.com',
                password: 'testAdminPass'
            })

        expect(loginRes.status).toBe(200)
        expect(res.status).toBe(201)
        expect(res.body.firstName).toBe('NewAdmin')
        expect(res.body.lastName).toBe('SecondAdmin')
        expect(res.body.email).toBe('admin@example.com')
        expect(res.body.role).toBe('admin')
        expect(res.body.passwordHash).toBeUndefined()
    })

    test('rejects admin creation without a token', async () => {
        const res = await request(app)
            .post('/users/admin')
            .send({
                firstName: 'NewAdmin',
                lastName: 'SecondAdmin',
                email: 'admin@example.com',
                password: 'testAdminPass'
            })

        expect(res.status).toBe(401)
        expect(res.body.message).toBe('Missing token')
    })

    test('rejects admin creation with a client token', async () => {
        await request(app)
            .post('/users')
            .send({
                firstName: 'Client',
                lastName: 'user',
                email: 'client@example.com',
                password: 'pass1234'
            })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'client@example.com',
                password: 'pass1234'
            })

        const res = await request(app)
            .post('/users/admin')
            .set('Authorization', `Bearer ${loginRes.body.token}`)
            .send({
                firstName: 'NewAdmin',
                lastName: 'SecondAdmin',
                email: 'admin@example.com',
                password: 'testAdminPass'
            })

        expect(res.status).toBe(403)
        expect(res.body.message).toBe('Admin privileges required')
    })

    test('gets and updates a user profile with valid auth', async () => {
        const passwordHash = await bcrypt.hash('pass1234', 10)
        const createdUser = await user.create({
            firstName: 'Profile',
            lastName: 'user',
            email: 'profile@example.com',
            passwordHash,
            role: 'client'
        })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'profile@example.com',
                password: 'pass1234'
            })

        const getRes = await request(app)
            .get(`/users/${createdUser.id}`)
            .set('Authorization', `Bearer ${loginRes.body.token}`)

        const updateRes = await request(app)
            .put(`/users/${createdUser.id}`)
            .set('Authorization', `Bearer ${loginRes.body.token}`)
            .send({
                firstName: 'Updated',
                lastName: 'user',
                email: 'updated@example.com',
                billingAddress: '123 Test Street',
                creditCardNumber: '4111111111111111',
                expirationDate: '12/30',
                cvv: '123'
            })

        expect(getRes.status).toBe(200)
        expect(getRes.body.email).toBe('profile@example.com')

        expect(updateRes.status).toBe(200)
        expect(updateRes.body.firstName).toBe('Updated')
        expect(updateRes.body.email).toBe('updated@example.com')
        expect(updateRes.body.message).toBe('Profile updated successfully')
    })

    test('admin can list clients with complete billing information', async () => {
        const adminHash = await bcrypt.hash('adminpass123', 10)
        await user.create({
            firstName: 'Admin',
            lastName: 'user',
            email: 'admin@example.com',
            passwordHash: adminHash,
            role: 'admin'
        })

        const clientHash = await bcrypt.hash('clientpass123', 10)
        await user.create({
            firstName: 'Billing',
            lastName: 'Client',
            email: 'billing@example.com',
            passwordHash: clientHash,
            role: 'client',
            billingAddress: '123 Test Street',
            creditCardNumber: '4111111111111111',
            expirationDate: '12/30',
            cvv: '123'
        })

        await user.create({
            firstName: 'NoBilling',
            lastName: 'Client',
            email: 'nobilling@example.com',
            passwordHash: clientHash,
            role: 'client'
        })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'admin@example.com',
                password: 'adminpass123'
            })

        const res = await request(app)
            .get('/users/billing/filled')
            .set('Authorization', `Bearer ${loginRes.body.token}`)

        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(1)
        expect(res.body[0].email).toBe('billing@example.com')
    })
})
