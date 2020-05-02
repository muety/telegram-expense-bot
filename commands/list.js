const _ = require('lodash')
    , cfg = require('./../config')
    , utils = require('./../utils')
    , db  = require('./../db')
    , ExpenseUtils = new require('./../model/expense_utils')

let eu = new ExpenseUtils()

module.exports = function (bot) {
    return function (message, args) {
        if (!args[0] && !args[1]) return bot.sendMessage(new bot.classes.Message(message.chat.id, `Please specify a month to list the expenses for.\nE.g. you can type \`${cfg.COMMANDS.LIST} April\` to get expenses for April or \`${cfg.COMMANDS.LIST} #food\``, 'Markdown'), () => {})
        let callback = function (err, all) {
            bot.sendMessage(new bot.classes.Message(message.chat.id, eu.prettyPrintAll(all), null, null, null, null, new bot.classes.ReplyKeyboardHide), () => {
            })
        }
        utils.queryExpensesByUserMessage(db.getCollection(), message, args, callback)
    }
}
