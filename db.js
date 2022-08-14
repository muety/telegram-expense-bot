const MongoClient = require('mongodb').MongoClient,
    config = require('./config.json')

const client = new MongoClient(config.DB_URL, { useUnifiedTopology: true })
const collections = {}

async function connect() {
    try {
        await client.connect()
        await client.db().command({ ping: 1 })
        console.log('Connected to database ...')

        // get collections
        collections.expenses = client.db().collection(config.DB_COLLECTION)
    } catch (e) {
        console.error(e)
        await disconnect()
    }
}

async function disconnect() {
    await client.close()
    console.log('Disconnected from database ...')
}

function expenses() {
    return collections.expenses
}

module.exports = {
    connect,
    disconnect,
    expenses,
}
