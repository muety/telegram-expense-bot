const cfg = require('./../config')
    , db = require('./../db')
    , utils = require('./../utils')

module.exports = function (bot) {
    return function (message, args) {
        if (!args[0] && !args[1]) {
            let keyboard = new bot.classes.ReplyKeyboardMarkup(4, null, true, null)
            Object.entries(cfg.MONTHS).forEach(e => {
                keyboard.addButton(new bot.classes.KeyboardButton(e[0]))
            })
            return bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: 'Select a month to view expenses for.',
                reply_markup: keyboard
            }), () => { })
        }

        let callback = function (err, all) {
            if (err) return
            const total = all.reduce((acc, val) => acc += parseFloat(val.total), 0).toFixed(2)

            let text = `You've spent a total of *${total}*.\n\n`
            text += all.map(e => `${e._id} – ${e.total}`).join('\n')

            bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text,
                parse_mode: 'Markdown',
                reply_markup: new bot.classes.ReplyKeyboardHide
            }), () => { })
        }

        utils.summarizeExpenses(db.getCollection(), message, args, callback)
    }
}
