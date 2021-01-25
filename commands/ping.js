const package = require('./../package.json')
    , LIMITS = require('./../config.json').RATE_LIMITS || {}
    , RateLimiter = require('./../middleware/rate_limit')

module.exports = function (bot) {
    const limiter = new RateLimiter(24 * 60 * 60, LIMITS['ping'] || -1)

    return function (message, args) {
        if (!limiter.check(message.chat.id, new Date(message.date * 1000))) {
            return
        }

        bot.sendMessage(new bot.classes.Message(message.chat.id, {
            text: `Version: \`${package.version}\``,
            parse_mode: 'Markdown',
        }))
    }
}
