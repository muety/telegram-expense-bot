const cfg = require('./../config')
    , db = require('./../db')
    , utils = require('./../utils')
    , CMD = cfg.COMMANDS.REPEAT

module.exports = function (bot) {
    return function (message, args) {
        const inputText = message.text.replace(CMD, '').trim()
        const [ amount, description, category ] = utils.parseExpenseInput(inputText) || []

        if (!amount)  return bot.sendMessage(new bot.classes.Message(message.chat.id, {
            text: `Invalid format. You need to send a message like \`${cfg.COMMANDS.REPEAT} 1.99 Cake #food\` to set up a recurring expense.`,
            parse_mode: 'Markdown'
        }))

        db.getCollection()
            .insertOne({
                user: message.chat.id,
                amount: amount,
                description: description,
                timestamp: new Date(message.date * 1000),
                category: category,
                isTemplate: true
            }, (err, ok) => {
                if (err) bot.sendMessage(new bot.classes.Message(message.chat.id, {
                    text: 'Sorry, something went wrong while setting up your recurring expense. Please try again.'
                }))
                else bot.sendMessage(new bot.classes.Message(message.chat.id, {
                    text: 'A new recurring expense has been scheduled and will first be counted next month. You can cancel it again using `/stop`.',
                    parse_mode: 'Markdown'
                }))
            })
    }
}
