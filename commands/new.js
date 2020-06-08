const db = require('./../db')
    , cfg = require('./../config')

module.exports = function (bot) {
    return function (message, args) {
        if (!args[0] || !args[1] || isNaN(parseFloat(args[0]))) {
            return bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: `Sorry, your command must look like this: \`${cfg.COMMANDS.NEW} 1.99 Lunch\`\nOptionally you could also specify a category using a hash tag like this:\`${cfg.COMMANDS.NEW} 1.99 Lunch #food\`. You can also simply leave out the \`${cfg.COMMANDS.NEW}\` and only type \`1.99 Lunch #food.\``,
                parse_mode: 'Markdown'
            }), () => { })
        }
        let amount = parseFloat(args[0])
        let category = !!args[args.length - 1] && args[args.length - 1].substr(0, 1) === '#'
            ? args[args.length - 1]
            : null
        let description = category
            ? args.slice(1, args.length - 1).join(' ')
            : args.slice(1, args.length).join(' ')

        db.getCollection().insert({
            user: message.chat.id,
            amount: amount,
            description: description,
            timestamp: new Date(),
            category: category
        }, (err, ok) => {
            if (err) bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: 'Sorry, something went wrong while saving your expense. Please try again.'
            }), () => { })
            else bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: 'Your expense has been saved.'
            }), () => { })
        })
    }
}
