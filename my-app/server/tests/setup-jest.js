const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.test' })

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI)
})

afterEach(async () => {
    const collections = mongoose.connection.collections

    for (const collection of Object.values(collections)) {
        await collection.deleteMany({})
    }
})

afterAll(async () => {
    await mongoose.disconnect()
})
