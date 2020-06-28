const package = require('./../package.json')

module.exports = function (bot) {
    return function (message, args) {
        bot.sendMessage(new bot.classes.Message(message.chat.id, {
            text: `Version: \`${package.version}\``,
            parse_mode: 'Markdown',
        }))
    }
}
