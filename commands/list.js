const cfg = require('./../config')
    , utils = require('./../utils')
    , LIMITS = require('./../config.json').RATE_LIMITS || {}
    , RateLimiter = require('./../middleware/rate_limit')

module.exports = function (bot) {
    const limiter = new RateLimiter(24 * 60 * 60, LIMITS['list'] || -1)

    return function (message, args) {
        if (!limiter.check(message.chat.id, new Date(message.date * 1000))) {
            return
        }

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