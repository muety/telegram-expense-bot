const _ = require('lodash')
    , cfg = require('./../config')
    , utils = require('./../utils')
    , db  = require('./../db')

module.exports = function (bot) {
    return function (message, args) {
        if (!args[0] && !args[1]) return bot.sendMessage(new bot.classes.Message(message.chat.id, `Please specify a month to list the expenses for.\nE.g. you can type \`${cfg.COMMANDS.LIST} April\` to get expenses for April or \`${cfg.COMMANDS.LIST} #food\``, 'Markdown'), () => {})
        let callback = function (err, all) {
            if (err) return
            bot.sendMessage(new bot.classes.Message(message.chat.id, all.join('\n'), null, null, null, null, new bot.classes.ReplyKeyboardHide), () => {
            })
        }

        utils.findExpenses(db.getCollection(), message, args, callback)
    }
}
