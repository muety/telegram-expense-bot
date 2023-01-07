const db = require('../db'),
    wrapAsync = require('../utils').wrapAsync,
    resolveTimeZone = require('../utils').resolveTimeZone,
    KeyValueService = require('../services/keyValue')

const keyValueService = new KeyValueService(db)

function onLocation(bot) {
    return async function (msg) {
        const userTimeZone = resolveTimeZone(msg.location.latitude, msg.location.longitude)
        await keyValueService.setUserTz(msg.chat.id, userTimeZone)
        await bot.sendMessage(msg.chat.id, `✅ Set your time zone to \`${userTimeZone}\``, {
            parse_mode: 'Markdown',
        })
    }
}

function register(bot, middleware) {
    console.log('✅ Registering handlers for location messages ...')
    bot.on('location', middleware(wrapAsync(onLocation(bot))))
}

module.exports = {
    register,
}
