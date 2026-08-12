const request = require('supertest')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const app = require('../app')
const user = require('../models/user')

describe('Auth', () => {
    test('register a new user', async () => {
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
    })
    test('login and verify JWT token with client role', async () => {
        const res1 = await request(app)
            .post('/users')
            .send({
                firstName: 'TesterFirst',
                lastName: 'TesterLast',
                email: 'test@example.com',
                password: 'pass1234'
            })

        const res2 = await request(app)
            .post('/users/login')
            .send({
                email: 'test@example.com',
                password: 'pass1234'
            })

        expect(res1.status).toBe(201)
        expect(res1.body.firstName).toBe('TesterFirst')
        expect(res1.body.lastName).toBe('TesterLast')

        expect(res2.status).toBe(200)
        expect(res2.body.token).toBeDefined()
        expect(res2.body.email).toBe('test@example.com')
        expect(res2.body.message).toBe('Login successful')

        const decoded = jwt.verify(res2.body.token, process.env.JWT_SECRET)
        expect(decoded.id).toBeDefined()
        expect(decoded.role).toBe('client')
    })
    test('admins can create other admins', async () => {
        const passwordHash = await bcrypt.hash('adminpass123', 10)

        await user.create({
            firstName: 'AdminFirst',
            lastName: 'AdminLast',
            email: 'testAdmin@example.com',
            passwordHash: passwordHash,
            role: 'admin'
        })

        const res1 = await request(app)
            .post('/users/login')
            .send({
                email: 'testAdmin@example.com',
                password: 'adminpass123'
            })

        const res2 = await request(app)
            .post('/users/admin')
            .set('Authorization', `Bearer ${res1.body.token}`)
            .send({
                firstName: 'NewAdmin',
                lastName: '2ndAdmin',
                email: 'admin@example.com',
                password: 'testAdminPass'
            })

        expect(res1.status).toBe(200)
        expect(res1.body.token).toBeDefined()
        expect(res1.body.email).toBe('testAdmin@example.com')
        expect(res1.body.message).toBe('Login successful')

        const decoded = jwt.verify(res1.body.token, process.env.JWT_SECRET)
        expect(decoded.id).toBeDefined()
        expect(decoded.role).toBe('admin')

        expect(res2.status).toBe(201)
        expect(res2.body.email).toBe('admin@example.com')
    })
})
