module.exports = function (bot) {
    return function (message, args) {
        bot.sendMessage(new bot.classes.Message(message.chat.id, {
            text: 'Yep, I\'m still alive!'
        }))
    }
}
