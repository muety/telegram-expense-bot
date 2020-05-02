const mongo = require('mongodb').MongoClient,
    cfg = require('./config')

let collExpenses = null
let _db = null

module.exports = {
    init: init,
    close: close,
    getCollection: function() {
        return collExpenses
    }
}

function init(callback) {
    mongo.connect(cfg.DB_URL, (err, db) => {
        if (err) {
            console.log(err)
            process.exit(1)
        }
        else console.log('Connected to database.')
        _db = db
        db.collection(cfg.DB_COLLECTION, (err, coll) => {
            if (err) return console.log(err)
            collExpenses = coll
            callback()
        })
    })
}

function close() {
    _db.close()
}