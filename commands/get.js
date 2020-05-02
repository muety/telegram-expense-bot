const _ = require('lodash')
    , cfg = require('./../config')
    , db = require('./../db')
    , utils = require('./../utils')

module.exports = function (bot) {
    return function (message, args) {
        if (!args[0] && !args[1]) {
            let keyboard = new bot.classes.ReplyKeyboardMarkup(4, null, true, null)
            _(cfg.MONTHS).forEach((val, month) => {
                keyboard.addButton(new bot.classes.KeyboardButton(month))
            })
            return bot.sendMessage(new bot.classes.Message(message.chat.id, 'Select a month to view expenses for.', null, null, null, null, keyboard), (res) => { })
        }

        let callback = function (err, total) {
            if (err) return
            bot.sendMessage(new bot.classes.Message(message.chat.id, `You have spent ${total}.`, null, null, null, null, new bot.classes.ReplyKeyboardHide), () => { })
        }

        utils.sumExpenses(db.getCollection(), message, args, callback)
    }
}
