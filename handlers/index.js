const path = require('path'),
    fs = require('fs'),
    noop = require('../middlewares/noop')

const handlers = fs
    .readdirSync(path.join(__dirname, '.'))
    .filter(p => p !== 'index.js')
    .map((p) => require(`./${p}`))

function registerAll(bot, rootMiddleware) {
    rootMiddleware = rootMiddleware || noop()
    handlers.forEach((h) => h.register(bot, rootMiddleware))
}

module.exports = {
    registerAll,
}
