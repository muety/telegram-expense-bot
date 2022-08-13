const path = require('path'),
    fs = require('fs')

const handlers = fs
    .readdirSync(path.join(__dirname, '.'))
    .filter(p => p !== 'index.js')
    .map((p) => require(`./${p}`))

function registerAll(bot) {
    handlers.forEach((h) => h.register(bot))
}

module.exports = {
    registerAll,
}
