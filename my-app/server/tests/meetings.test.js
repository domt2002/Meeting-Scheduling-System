const request = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const user = require('../models/user')
const room = require('../models/room')
const meeting = require('../models/meeting')

describe('meetings', () => {
    test('rejects meeting requests without a token', async () => {
        const res = await request(app).get('/meetings')

        expect(res.status).toBe(401)
        expect(res.body.message).toBe('Missing token')
    })

    test('client can create a meeting in an available room slot', async () => {
        const passwordHash = await bcrypt.hash('clientpass123', 10)
        await user.create({
            firstName: 'Client',
            lastName: 'user',
            email: 'client@example.com',
            passwordHash,
            role: 'client'
        })
        const createdRoom = await room.create({
            name: 'Conference room',
            capacity: 5,
            special: false
        })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'client@example.com',
                password: 'clientpass123'
            })

        const res = await request(app)
            .post('/meetings')
            .set('Authorization', `Bearer ${loginRes.body.token}`)
            .send({
                name: 'Planning meeting',
                roomId: createdRoom.id,
                day: 'Monday',
                start: 9,
                end: 10
            })

        expect(res.status).toBe(201)
        expect(res.body.name).toBe('Planning meeting')
        expect(res.body.day).toBe('Monday')
        expect(res.body.start).toBe(9)
        expect(res.body.end).toBe(10)
        expect(res.body.room.name).toBe('Conference room')
    })

    test('rejects invalid meeting day and time ranges', async () => {
        const passwordHash = await bcrypt.hash('clientpass123', 10)
        await user.create({
            firstName: 'Client',
            lastName: 'user',
            email: 'client@example.com',
            passwordHash,
            role: 'client'
        })
        const createdRoom = await room.create({
            name: 'Conference room',
            capacity: 5
        })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'client@example.com',
                password: 'clientpass123'
            })

        const invalidDayRes = await request(app)
            .post('/meetings')
            .set('Authorization', `Bearer ${loginRes.body.token}`)
            .send({
                name: 'Weekend meeting',
                roomId: createdRoom.id,
                day: 'Saturday',
                start: 9,
                end: 10
            })

        const invalidTimeRes = await request(app)
            .post('/meetings')
            .set('Authorization', `Bearer ${loginRes.body.token}`)
            .send({
                name: 'Bad Time meeting',
                roomId: createdRoom.id,
                day: 'Monday',
                start: 10,
                end: 10
            })

        expect(invalidDayRes.status).toBe(400)
        expect(invalidDayRes.body.message).toBe('Invalid day! Only Mon-Fri')
        expect(invalidTimeRes.status).toBe(400)
        expect(invalidTimeRes.body.message).toBe('Error, meeting endd has to be after the start')
    })

    test('prevents overlapping meetings in the same room', async () => {
        const passwordHash = await bcrypt.hash('clientpass123', 10)
        const createdUser = await user.create({
            firstName: 'Client',
            lastName: 'user',
            email: 'client@example.com',
            passwordHash,
            role: 'client'
        })
        const createdRoom = await room.create({
            name: 'Conference room',
            capacity: 5
        })

        await meeting.create({
            name: 'Existing meeting',
            room: createdRoom.id,
            author: createdUser.id,
            day: 'Monday',
            start: 9,
            end: 11
        })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'client@example.com',
                password: 'clientpass123'
            })

        const res = await request(app)
            .post('/meetings')
            .set('Authorization', `Bearer ${loginRes.body.token}`)
            .send({
                name: 'Overlapping meeting',
                roomId: createdRoom.id,
                day: 'Monday',
                start: 10,
                end: 12
            })

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Error, room has already been booked for this time slot!')
    })

    test('requires special room fee before booking a special room', async () => {
        const passwordHash = await bcrypt.hash('clientpass123', 10)
        await user.create({
            firstName: 'Client',
            lastName: 'user',
            email: 'client@example.com',
            passwordHash,
            role: 'client'
        })
        const specialRoom = await room.create({
            name: 'Special room',
            capacity: 5,
            special: true
        })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'client@example.com',
                password: 'clientpass123'
            })

        const rejectedRes = await request(app)
            .post('/meetings')
            .set('Authorization', `Bearer ${loginRes.body.token}`)
            .send({
                name: 'Special meeting',
                roomId: specialRoom.id,
                day: 'Tuesday',
                start: 9,
                end: 10
            })

        const acceptedRes = await request(app)
            .post('/meetings')
            .set('Authorization', `Bearer ${loginRes.body.token}`)
            .send({
                name: 'Paid Special meeting',
                roomId: specialRoom.id,
                day: 'Tuesday',
                start: 9,
                end: 10,
                specialFeePaid: true
            })

        expect(rejectedRes.status).toBe(402)
        expect(rejectedRes.body.amount).toBe(100)
        expect(acceptedRes.status).toBe(201)
        expect(acceptedRes.body.specialFeePaid).toBe(true)
    })

    test('returns free and busy slots for a room/day', async () => {
        const passwordHash = await bcrypt.hash('clientpass123', 10)
        const createdUser = await user.create({
            firstName: 'Client',
            lastName: 'user',
            email: 'client@example.com',
            passwordHash,
            role: 'client'
        })
        const createdRoom = await room.create({
            name: 'Conference room',
            capacity: 5
        })

        await meeting.create({
            name: 'Existing meeting',
            room: createdRoom.id,
            author: createdUser.id,
            day: 'Wednesday',
            start: 10,
            end: 12
        })

        const loginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'client@example.com',
                password: 'clientpass123'
            })

        const res = await request(app)
            .get('/meetings/free')
            .set('Authorization', `Bearer ${loginRes.body.token}`)
            .query({
                roomId: createdRoom.id,
                day: 'Wednesday'
            })

        expect(res.status).toBe(200)
        expect(res.body.day).toBe('Wednesday')
        expect(res.body.slots).toHaveLength(8)
        expect(res.body.slots.find((slot) => slot.start === 9).free).toBe(true)
        expect(res.body.slots.find((slot) => slot.start === 10).free).toBe(false)
        expect(res.body.slots.find((slot) => slot.start === 11).free).toBe(false)
        expect(res.body.slots.find((slot) => slot.start === 12).free).toBe(true)
    })

    test('author can invite an attendee and attendee can accept', async () => {
        const authorHash = await bcrypt.hash('authorpass123', 10)
        const author = await user.create({
            firstName: 'Author',
            lastName: 'user',
            email: 'author@example.com',
            passwordHash: authorHash,
            role: 'client'
        })

        const attendeeHash = await bcrypt.hash('attendeepass123', 10)
        await user.create({
            firstName: 'Attendee',
            lastName: 'user',
            email: 'attendee@example.com',
            passwordHash: attendeeHash,
            role: 'client'
        })

        const createdRoom = await room.create({
            name: 'Conference room',
            capacity: 5
        })

        const createdMeeting = await meeting.create({
            name: 'Invite meeting',
            room: createdRoom.id,
            author: author.id,
            day: 'Thursday',
            start: 9,
            end: 10
        })

        const authorLoginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'author@example.com',
                password: 'authorpass123'
            })

        const inviteRes = await request(app)
            .post(`/meetings/${createdMeeting.id}/attendees`)
            .set('Authorization', `Bearer ${authorLoginRes.body.token}`)
            .send({
                attendee: 'attendee@example.com'
            })

        const attendeeLoginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'attendee@example.com',
                password: 'attendeepass123'
            })

        const acceptRes = await request(app)
            .post(`/meetings/${createdMeeting.id}/accept`)
            .set('Authorization', `Bearer ${attendeeLoginRes.body.token}`)

        const updatedMeeting = await meeting.findById(createdMeeting.id)

        expect(inviteRes.status).toBe(200)
        expect(inviteRes.body.invited).toContain('attendee@example.com')
        expect(acceptRes.status).toBe(200)
        expect(acceptRes.body.message).toBe('Invitation accepted')
        expect(updatedMeeting.invited).not.toContain('attendee@example.com')
        expect(updatedMeeting.attendees).toContain('attendee@example.com')
    })

    test('author can request ownership transfer and requested user can accept', async () => {
        const authorHash = await bcrypt.hash('authorpass123', 10)
        const author = await user.create({
            firstName: 'Author',
            lastName: 'user',
            email: 'author@example.com',
            passwordHash: authorHash,
            role: 'client'
        })

        const newOwnerHash = await bcrypt.hash('ownerpass123', 10)
        const newOwner = await user.create({
            firstName: 'NewOwner',
            lastName: 'user',
            email: 'newowner@example.com',
            passwordHash: newOwnerHash,
            role: 'client'
        })

        const createdRoom = await room.create({
            name: 'Conference room',
            capacity: 5
        })

        const createdMeeting = await meeting.create({
            name: 'Transfer meeting',
            room: createdRoom.id,
            author: author.id,
            day: 'Friday',
            start: 9,
            end: 10
        })

        const authorLoginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'author@example.com',
                password: 'authorpass123'
            })

        const requestRes = await request(app)
            .post(`/meetings/${createdMeeting.id}/transfer`)
            .set('Authorization', `Bearer ${authorLoginRes.body.token}`)
            .send({
                email: 'newowner@example.com'
            })

        const newOwnerLoginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'newowner@example.com',
                password: 'ownerpass123'
            })

        const acceptRes = await request(app)
            .post(`/meetings/${createdMeeting.id}/transfer/accept`)
            .set('Authorization', `Bearer ${newOwnerLoginRes.body.token}`)

        const updatedMeeting = await meeting.findById(createdMeeting.id)

        expect(requestRes.status).toBe(200)
        expect(acceptRes.status).toBe(200)
        expect(acceptRes.body.message).toBe('Ownership successfully transferred.')
        expect(String(updatedMeeting.author)).toBe(newOwner.id)
        expect(updatedMeeting.pendingTransfer).toBe('')
        expect(updatedMeeting.attendees).toContain('author@example.com')
    })

    test('non-author cannot delete a meeting but admin can', async () => {
        const authorHash = await bcrypt.hash('authorpass123', 10)
        const author = await user.create({
            firstName: 'Author',
            lastName: 'user',
            email: 'author@example.com',
            passwordHash: authorHash,
            role: 'client'
        })

        const otherHash = await bcrypt.hash('otherpass123', 10)
        await user.create({
            firstName: 'Other',
            lastName: 'user',
            email: 'other@example.com',
            passwordHash: otherHash,
            role: 'client'
        })

        const adminHash = await bcrypt.hash('adminpass123', 10)
        await user.create({
            firstName: 'Admin',
            lastName: 'user',
            email: 'admin@example.com',
            passwordHash: adminHash,
            role: 'admin'
        })

        const createdRoom = await room.create({
            name: 'Conference room',
            capacity: 5
        })

        const createdMeeting = await meeting.create({
            name: 'Delete meeting',
            room: createdRoom.id,
            author: author.id,
            day: 'Monday',
            start: 13,
            end: 14
        })

        const otherLoginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'other@example.com',
                password: 'otherpass123'
            })

        const forbiddenRes = await request(app)
            .delete(`/meetings/${createdMeeting.id}`)
            .set('Authorization', `Bearer ${otherLoginRes.body.token}`)

        const adminLoginRes = await request(app)
            .post('/users/login')
            .send({
                email: 'admin@example.com',
                password: 'adminpass123'
            })

        const deleteRes = await request(app)
            .delete(`/meetings/${createdMeeting.id}`)
            .set('Authorization', `Bearer ${adminLoginRes.body.token}`)

        const deletedMeeting = await meeting.findById(createdMeeting.id)

        expect(forbiddenRes.status).toBe(403)
        expect(deleteRes.status).toBe(200)
        expect(deleteRes.body.message).toBe('Meeting successfully cancelled')
        expect(deletedMeeting).toBeNull()
    })
})
