const cfg = require('./../config')
    , utils = require('./../utils')
    , db = require('./../db')
    , Expense = require('./../model/expense')

module.exports = function (bot) {
    return async function (message, args) {
        const coll = db.getCollection()

        let userTemplates = await (new Promise((resolve, reject) => {
            coll
                .find({
                    user: message.chat.id,
                    isTemplate: true
                })
                .toArray((err, templates) => {
                    if (err) return reject(templates)
                    resolve(templates)
                })
        }))

        function print() {
            if (!userTemplates.length) return '_none_'
            return userTemplates
                .map(t => new Expense(
                    t.user, t.amount.toFixed(2), t.description, t.timestamp, t.category, null
                ))
                .map((t, i) => `**${i + 1}** – ${t.toString(true)}`)
                .join('\n')
        }

        if (!args[0]) {
            return bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: `Please send \`${cfg.COMMANDS.STOP}\` alongside the number of the expense to stop, e.g. \`${cfg.COMMANDS.STOP} 1\`. The following recurring expenses are currently active: \n\n${print()}`,
                parse_mode: 'Markdown'
            }))
        }

        const index = parseInt(args[0])

        if (!index || index > userTemplates.length) {
            return bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: `Invalid command, sorry 😕`
            }))
        }

        coll.deleteOne({ _id: userTemplates[index - 1]._id })
            .then(() => {
                userTemplates.splice(index - 1, 1)
                bot.sendMessage(new bot.classes.Message(message.chat.id, {
                    text: `Recurring expense cancelled. The following are still active:\n\n${print()}`,
                    parse_mode: 'Markdown'
                }))
            })
            .catch(() => {})

        const callback = function (err, all) {
            if (err) return
            bot.sendMessage(new bot.classes.Message(message.chat.id, {
                text: all.join('\n'),
                reply_markup: new bot.classes.ReplyKeyboardHide
            }), () => { })
        }

        utils.findExpenses(db.getCollection(), message, args, callback)
    }
}