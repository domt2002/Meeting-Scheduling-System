const request = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const user = require('../models/user')
const complaint = require('../models/complaint')

describe('complaints', () => {
    test('rejects complaint access without a token', async () => {
        const res = await request(app).get('/complaints')

        expect(res.status).toBe(401)
        expect(res.body.message).toBe('Missing token')
    })

    test('client can create and list only their own complaints', async () => {
        const clientHash = await bcrypt.hash('clientpass123', 10)
        await user.create({
            firstName: 'Client',
            lastName: 'user',
            email: 'client@example.com',
            passwordHash: clientHash,
            role: 'client'
        })

        await user.create({
            firstName: 'Other',
            lastName: 'Client',
            email: 'other@example.com',
            passwordHash: clientHash,
            role: 'client'
        })

        await complaint.create({
            subject: 'Other issue',
            description: 'This belongs to another client.',
            submittedBy: 'Other Client',
            submittedByEmail: 'other@example.com'
        })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'client@example.com',
                password: 'clientpass123'
            })

        const createRes = await request(app)
            .post('/complaints')
            .set('Authorization', `Bearer ${loginRes.body.token}`)
            .send({
                subject: 'Projector broken',
                description: 'The projector in room A does not turn on.',
                priority: 'High'
            })

        const listRes = await request(app)
            .get('/complaints')
            .set('Authorization', `Bearer ${loginRes.body.token}`)

        expect(createRes.status).toBe(201)
        expect(createRes.body.subject).toBe('Projector broken')
        expect(createRes.body.submittedBy).toBe('Client user')
        expect(createRes.body.submittedByEmail).toBe('client@example.com')
        expect(createRes.body.status).toBe('Open')

        expect(listRes.status).toBe(200)
        expect(listRes.body).toHaveLength(1)
        expect(listRes.body[0].submittedByEmail).toBe('client@example.com')
    })

    test('admin can list all complaints and respond to one', async () => {
        const adminHash = await bcrypt.hash('adminpass123', 10)
        await user.create({
            firstName: 'Admin',
            lastName: 'user',
            email: 'admin@example.com',
            passwordHash: adminHash,
            role: 'admin'
        })

        await complaint.create({
            subject: 'First issue',
            description: 'First complaint.',
            submittedBy: 'Client One',
            submittedByEmail: 'one@example.com'
        })

        const createdComplaint = await complaint.create({
            subject: 'Second issue',
            description: 'Second complaint.',
            submittedBy: 'Client Two',
            submittedByEmail: 'two@example.com'
        })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'admin@example.com',
                password: 'adminpass123'
            })

        const listRes = await request(app)
            .get('/complaints')
            .set('Authorization', `Bearer ${loginRes.body.token}`)

        const responseRes = await request(app)
            .put(`/complaints/${createdComplaint.id}/response`)
            .set('Authorization', `Bearer ${loginRes.body.token}`)
            .send({
                response: 'Maintenance has been notified.'
            })

        expect(listRes.status).toBe(200)
        expect(listRes.body).toHaveLength(2)

        expect(responseRes.status).toBe(200)
        expect(responseRes.body.response).toBe('Maintenance has been notified.')
        expect(responseRes.body.status).toBe('Answered')
    })

    test('client cannot answer complaints', async () => {
        const clientHash = await bcrypt.hash('clientpass123', 10)
        await user.create({
            firstName: 'Client',
            lastName: 'user',
            email: 'client@example.com',
            passwordHash: clientHash,
            role: 'client'
        })

        const createdComplaint = await complaint.create({
            subject: 'Issue',
            description: 'complaint text.',
            submittedBy: 'Client user',
            submittedByEmail: 'client@example.com'
        })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'client@example.com',
                password: 'clientpass123'
            })

        const res = await request(app)
            .put(`/complaints/${createdComplaint.id}/response`)
            .set('Authorization', `Bearer ${loginRes.body.token}`)
            .send({
                response: 'I should not be allowed.'
            })

        expect(res.status).toBe(403)
        expect(res.body.message).toBe('Admin privileges required')
    })
})
