const db = require('./../db')
    , cfg = require('./../config')
    , utils = require('./../utils')
    , CMD = cfg.COMMANDS.NEW
    , LIMITS = require('./../config.json').RATE_LIMITS || {}
    , RateLimiter = require('./../middleware/rate_limit')

module.exports = function (bot) {
    const limiter = new RateLimiter(24 * 60 * 60, LIMITS['new'] || -1)

    return function (message, args) {
        if (!limiter.check(message.chat.id, new Date(message.date * 1000))) {
            return
        }

        const inputText = message.text.replace(CMD, '').trim()
        const [ amount, description, category ] = utils.parseExpenseInput(inputText) || []

        if (!amount) return bot.sendMessage(new bot.classes.Message(message.chat.id, {
            text: `Sorry, your command must look like this: \`${cfg.COMMANDS.NEW} 1.99 Lunch\`\nOptionally you could also specify a category using a hash tag like this:\`${cfg.COMMANDS.NEW} 1.99 Lunch #food\`. You can also simply leave out the \`${cfg.COMMANDS.NEW}\` and only type \`1.99 Lunch #food.\``,
            parse_mode: 'Markdown'
        }))

        db.getCollection().insertOne({
            user: message.chat.id,
            amount: amount,
            description: description,
            timestamp: new Date(message.date * 1000),
            category: category
        }, (err, ok) => {
            if (err) bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: '❌ Sorry, something went wrong while saving your expense. Please try again.'
            }))
            else bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: `✅ Added *${amount}*.`,
                parse_mode: 'Markdown'
            }))
        })
    }
}
