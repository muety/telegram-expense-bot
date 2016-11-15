const _ = require('lodash')
    , db  = require('./../db')
    , cfg = require('./../config');

module.exports = function (bot) {
    return function (message, args) {
        if (!args[0] || !args[1] || _.isNaN(parseFloat(args[0]))) {
            return bot.sendMessage(new bot.classes.Message(message.chat.id, `Sorry, your command must look like this: \`${cfg.COMMANDS.NEW} 1.99 Lunch\`\nOptionally you could also specify a category using a hash tag like this:\`${cfg.COMMANDS.NEW} 1.99 Lunch #food\`. You can also simply leave out the \`${cfg.COMMANDS.NEW}\` and only type \`1.99 Lunch #food.\``, 'Markdown'), () => {
            });
        }
        var amount = parseFloat(args[0]);
        var category = !_.isNull(args[args.length - 1]) && args[args.length - 1].substr(0, 1) == '#' ? args[args.length - 1] : null;
        var description = category ? _.join(_.slice(args, 1, args.length - 1), ' ') : _.join(_.slice(args, 1), ' ');

        db.getCollection().insert({
            user: message.chat.id,
            amount: amount,
            description: description,
            timestamp: new Date(),
            category: category
        }, (err, ok) => {
            if (err) bot.sendMessage(new bot.classes.Message(message.chat.id, 'Sorry, something went wrong while saving your expense. Please try again.'), () => {
            });
            else bot.sendMessage(new bot.classes.Message(message.chat.id, 'Your expense has been saved.'), () => {
            });
        });
    }
};
