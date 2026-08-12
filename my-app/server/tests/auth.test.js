const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app')

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
        expect(res.body.email).toBe('test@example.com')
        expect(res.body.role).toBe('client')
        expect(res.body.password).toBeUndefined()
    })
})
