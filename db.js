const db = require('mongodb').MongoClient
, cfg = require('./config');

var collExpenses = null;

module.exports = {
    init: init,
    getCollection: function () {
        return collExpenses
    }
};

function init(callback) {
    db.connect(cfg.DB_URL, (err, db) => {
        if (err) return console.log(err);
        else console.log('Connected to database.');
        db.collection(cfg.DB_COLLECTION, (err, coll) => {
            if (err) return console.log(err);
            collExpenses = coll;
            callback();
        })
    }); 
}
    