const cfg = require('./../config')
    , utils = require('./../utils')
    , LIMITS = require('./../config.json').RATE_LIMITS || {}
    , RateLimiter = require('./../middleware/rate_limit')

module.exports = function (bot) {
    const limiter = new RateLimiter(24 * 60 * 60, LIMITS['reset'] || -1)

    return function (message, args) {
        if (!limiter.check(message.chat.id, new Date(message.date * 1000))) {
            return
        }

        if (!args[0] && !args[1]) return bot.sendMessage(new bot.classes.Message(message.chat.id, {
            text: `Please specify a month or category to reset the expenses for.\nE.g. you can type \`${cfg.COMMANDS.RESET} April\` to remove expenses for April or \`${cfg.COMMANDS.RESET} #food\``,
            parse_mode: 'Markdown'
        }))
        let callback = function (err, all) {
            if (err) bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: `Sorry, failed to reset your expenses. Make sure your command look like one of those in the /help.`,
                parse_mode: new bot.classes.ReplyKeyboardHide
            }))
            bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: `Successfully reset your expenses.`,
                parse_mode: new bot.classes.ReplyKeyboardHide
            }))
        }
        utils.deleteExpenses(message, args, callback)
    }
}
