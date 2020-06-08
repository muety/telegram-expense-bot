const cfg = require('./../config')
    , db = require('./../db')
    , utils = require('./../utils')

module.exports = function (bot) {
    return function (message, args) {
        if (!args[0] && !args[1]) return bot.sendMessage(new bot.classes.Message(message.chat.id, {
            text: `Please specify a month or category to reset the expenses for.\nE.g. you can type \`${cfg.COMMANDS.RESET} April\` to remove expenses for April or \`${cfg.COMMANDS.RESET} #food\``,
            parse_mode: 'Markdown'
        }), () => { })
        let callback = function (err, all) {
            if (err) bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: `Sorry, failed to reset your expenses. Make sure your command look like one of those in the /help.`,
                parse_mode: new bot.classes.ReplyKeyboardHide
            }), () => { })
            bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: `Successfully reset your expenses.`,
                parse_mode: new bot.classes.ReplyKeyboardHide
            }), () => { })
        }
        utils.deleteExpenses(db.getCollection(), message, args, callback)
    }
}
