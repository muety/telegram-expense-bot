const db = require('./../db')
    , cfg = require('./../config')
    , utils = require('./../utils')

module.exports = function (bot) {
    return function (message, args) {
        const [ amount, description, category ] = utils.parseExpenseInput(message.text) || []

        if (!amount) return bot.sendMessage(new bot.classes.Message(message.chat.id, {
            text: `Sorry, your command must look like this: \`${cfg.COMMANDS.NEW} 1.99 Lunch\`\nOptionally you could also specify a category using a hash tag like this:\`${cfg.COMMANDS.NEW} 1.99 Lunch #food\`. You can also simply leave out the \`${cfg.COMMANDS.NEW}\` and only type \`1.99 Lunch #food.\``,
            parse_mode: 'Markdown'
        }))

        db.getCollection().insertOne({
            user: message.chat.id,
            amount: amount,
            description: description,
            timestamp: new Date(),
            category: category
        }, (err, ok) => {
            if (err) bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: 'Sorry, something went wrong while saving your expense. Please try again.'
            }))
            else bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: 'Your expense has been saved.'
            }))
        })
    }
}
