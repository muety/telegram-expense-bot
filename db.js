const mongo = require('mongodb').MongoClient,
    cfg = require('./config')

let collExpenses = null
let _db = null
let _client = null

function init(callback) {
    mongo.connect(cfg.DB_URL, { useUnifiedTopology: true }, (err, client) => {
        if (err) {
            console.log(err)
            process.exit(1)
        } else {
            console.log('Connected to database.')
        }

        _client = client
        _db = client.db()

        _db.collection(cfg.DB_COLLECTION, (err, coll) => {
            if (err) return console.log(err)
            collExpenses = coll
            callback()
        })
    })
}

function close() {
    return _client.close()
}

function isConnected() {
    return _client.isConnected()
}

module.exports = {
    init,
    close,
    isConnected,
    getCollection: function() {
        return collExpenses
    }
}