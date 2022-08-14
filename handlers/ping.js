const package = require('./../package.json')

function onPing(bot) {
    return async function (msg) {
        await bot.sendMessage(msg.chat.id, `Version: \`${package.version}\``, {
            parse_mode: 'Markdown',
        })
    }
}

function register(bot) {
    console.log('Registering handlers for /ping ...')
    bot.onText(/\/ping/, onPing(bot))
}

module.exports = {
    register,
}
