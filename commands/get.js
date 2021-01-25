const cfg = require('./../config')
    , utils = require('./../utils')
    , LIMITS = require('./../config.json').RATE_LIMITS || {}
    , RateLimiter = require('./../middleware/rate_limit')

module.exports = function (bot) {
    const limiter = new RateLimiter(24 * 60 * 60, LIMITS['get'] || -1)

    return function (message, args) {
        if (!limiter.check(message.chat.id, new Date(message.date * 1000))) {
            return
        }

        if (!args[0] && !args[1]) {
            let keyboard = new bot.classes.ReplyKeyboardMarkup(4, null, true, null)
            Object.entries(cfg.MONTHS).forEach(e => {
                keyboard.addButton(new bot.classes.KeyboardButton(e[0]))
            })
            return bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: 'Select a month to view expenses for.',
                reply_markup: keyboard
            }))
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
            }))
        }

        utils.summarizeExpenses(message, args, callback)
    }
}
