const package = require('./../package.json'),
    wrapAsync = require('../utils').wrapAsync

function onPing(bot) {
    return async function (msg) {
        await bot.sendMessage(msg.chat.id, `Version: \`${package.version}\``, {
            parse_mode: 'Markdown',
        })
    }
}

function register(bot, middleware) {
    console.log('✅ Registering handlers for /ping ...')
    bot.onText(/\/ping/, middleware(wrapAsync(onPing(bot))))
}

module.exports = {
    register,
}
