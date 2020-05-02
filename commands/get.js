const _ = require('lodash')
    , cfg = require('./../config')
    , db  = require('./../db')
    , utils = require('./../utils')
    , ExpenseUtils = new require('./../model/expense_utils')

let eu = new ExpenseUtils()

module.exports = function (bot) {
    return function (message, args) {
        if (!args[0] && !args[1]) {
            let keyboard = new bot.classes.ReplyKeyboardMarkup(4, null, true, null)
            _(cfg.MONTHS).forEach((val, month) => {
                keyboard.addButton(new bot.classes.KeyboardButton(month))
            })
            return bot.sendMessage(new bot.classes.Message(message.chat.id, 'Select a month to view expenses for.', null, null, null, null, keyboard), (res) => {})
        }

        let callback = function (err, all) {
            let sum = eu.sumUp(all)
            bot.sendMessage(new bot.classes.Message(message.chat.id, `You have spent ${sum}.`, null, null, null, null, new bot.classes.ReplyKeyboardHide), () => {})
        }
        utils.queryExpensesByUserMessage(db.getCollection(), message, args, callback)
    }
}
