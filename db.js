const mongo = require('mongodb').MongoClient

cfg = require('./config');

var collExpenses = null;

module.exports = {
    init: init,
    close: close,
    getCollection: function() {
        return collExpenses
    }
};

function init(callback) {
    mongo.connect(cfg.DB_URL, (err, db) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        else console.log('Conectado com o Banco de dados');
        collExpenses = db.db(cfg.DB_NAME).collection(cfg.DB_COLLECTION)
        callback();
    });
}

 function close() {
     _db.close();
 }