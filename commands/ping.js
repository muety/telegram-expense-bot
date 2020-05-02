const ExpenseUtils = new require('./../model/expense_utils')

let eu = new ExpenseUtils()

module.exports = function (bot) {
    return function (message, args) {
        bot.sendMessage(new bot.classes.Message(message.chat.id, 'Yep, I\'m still alive!'))
    }
}
