const cfg = require('./../config')
    , utils = require('./../utils')

module.exports = function (bot) {
    return function (message, args) {
        const user = message.from.id
        const re = /\/broadcast (\/yes )?(.+)/gs
        const regexResult = [...(message.text.matchAll(re))][0]

        if (!cfg.ADMINS.includes(user) || !regexResult || !regexResult[2]) return

        const dry = !regexResult[1]

        utils.getActiveUsers()
            .then(users => {
                const sendTo = dry ? users.filter(uid => uid === user) : users
                sendTo.forEach(uid => bot.sendMessage(new bot.classes.Message(uid, {
                        text: regexResult[2],
                        parse_mode: 'Markdown'
                    })
                ))

                bot.sendMessage(new bot.classes.Message(message.chat.id, {
                    text: `✅ Sent to *${users.length}* users ${dry ? '(dry mode, use with \`/yes\`)' : ''}`,
                    parse_mode: 'Markdown'
                }))
            })
            .catch(() => {
                bot.sendMessage(new bot.classes.Message(message.chat.id, {
                    text: `🚫 Failed to send to *${users.length}* users ${dry ? '(dry mode)' : ''}`,
                    parse_mode: 'Markdown'
                }))
            })
    }
}
