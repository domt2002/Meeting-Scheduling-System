const request = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const user = require('../models/user')
const room = require('../models/room')
const meeting = require('../models/meeting')

describe('rooms', () => {
    test('lists rooms', async () => {
        await room.create({
            name: 'First room',
            capacity: 4,
            special: false,
            location: 'Second floor'
        })

        await room.create({
            name: 'Second room',
            capacity: 8,
            special: true,
            location: 'First floor'
        })

        const res = await request(app).get('/rooms')

        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(2)
        expect(res.body[0].name).toBe('First room')
        expect(res.body[1].name).toBe('Second room')
    })

    test('admin can create a room', async () => {
        const passwordHash = await bcrypt.hash('adminpass123', 10)
        await user.create({
            firstName: 'Admin',
            lastName: 'user',
            email: 'admin@example.com',
            passwordHash,
            role: 'admin'
        })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'admin@example.com',
                password: 'adminpass123'
            })

        const res = await request(app)
            .post('/rooms')
            .set('Authorization', `Bearer ${loginRes.body.token}`)
            .send({
                name: 'Conference room',
                capacity: 10,
                special: false,
                location: 'Main building'
            })

        expect(res.status).toBe(201)
        expect(res.body.name).toBe('Conference room')
        expect(res.body.capacity).toBe(10)
        expect(res.body.special).toBe(false)
    })

    test('client cannot create a room', async () => {
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
            .post('/rooms')
            .set('Authorization', `Bearer ${loginRes.body.token}`)
            .send({
                name: 'Conference room',
                capacity: 10,
                special: false
            })

        expect(res.status).toBe(403)
        expect(res.body.message).toBe('Error Admin only function')
    })

    test('rejects duplicate room names', async () => {
        const passwordHash = await bcrypt.hash('adminpass123', 10)
        await user.create({
            firstName: 'Admin',
            lastName: 'user',
            email: 'admin@example.com',
            passwordHash,
            role: 'admin'
        })
        await room.create({ name: 'Conference room', capacity: 10 })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'admin@example.com',
                password: 'adminpass123'
            })

        const res = await request(app)
            .post('/rooms')
            .set('Authorization', `Bearer ${loginRes.body.token}`)
            .send({
                name: 'Conference room',
                capacity: 12,
                special: false
            })

        expect(res.status).toBe(409)
        expect(res.body.message).toBe('Error, room name already taken')
    })

    test('admin cannot delete a room with existing meetings', async () => {
        const adminHash = await bcrypt.hash('adminpass123', 10)
        await user.create({
            firstName: 'Admin',
            lastName: 'user',
            email: 'admin@example.com',
            passwordHash: adminHash,
            role: 'admin'
        })

        const clientHash = await bcrypt.hash('clientpass123', 10)
        const createdUser = await user.create({
            firstName: 'Client',
            lastName: 'user',
            email: 'client@example.com',
            passwordHash: clientHash,
            role: 'client'
        })

        const createdRoom = await room.create({
            name: 'Booked room',
            capacity: 6
        })

        await meeting.create({
            name: 'Planning meeting',
            room: createdRoom.id,
            author: createdUser.id,
            day: 'Monday',
            start: 9,
            end: 10
        })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'admin@example.com',
                password: 'adminpass123'
            })

        const res = await request(app)
            .delete(`/rooms/${createdRoom.id}`)
            .set('Authorization', `Bearer ${loginRes.body.token}`)

        expect(res.status).toBe(409)
        expect(res.body.message).toBe('Cannot delete room. Existing meetings in room')
    })

    test('admin can delete an unbooked room', async () => {
        const passwordHash = await bcrypt.hash('adminpass123', 10)
        await user.create({
            firstName: 'Admin',
            lastName: 'user',
            email: 'admin@example.com',
            passwordHash,
            role: 'admin'
        })

        const createdRoom = await room.create({
            name: 'Empty room',
            capacity: 6
        })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'admin@example.com',
                password: 'adminpass123'
            })

        const res = await request(app)
            .delete(`/rooms/${createdRoom.id}`)
            .set('Authorization', `Bearer ${loginRes.body.token}`)

        expect(res.status).toBe(200)
        expect(res.body.message).toBe('Successfully deleted room')
    })
})
