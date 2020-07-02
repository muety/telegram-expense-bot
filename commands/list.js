const cfg = require('./../config')
    , utils = require('./../utils')
    , db = require('./../db')

module.exports = function (bot) {
    return function (message, args) {
        if (!args[0] && !args[1]) return bot.sendMessage(new bot.classes.Message(message.chat.id, {
            text: `Please specify a month to list the expenses for.\nE.g. you can type \`${cfg.COMMANDS.LIST} April\` to get expenses for April or \`${cfg.COMMANDS.LIST} #food\``,
            parse_mode: 'Markdown'
        }))

        const callback = function (err, all) {
            if (err) return
            bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: all.join('\n'),
                reply_markup: new bot.classes.ReplyKeyboardHide
            }), () => {})
        }

        utils.findExpenses(message, args, callback)
    }
}