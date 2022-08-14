const Expense = require('../model/expense')

const db = require('../db'),
    ExpensesService = require('../services/expenses')

const PATTERN_DEFAULT = /^\/repeat$/i
const PATTERN_PARAMS =
    /^\/repeat ((?:(?:\-?[0-9]+(?:\.[0-9]{0,2})?)|(?:[\+\-\*\/\s]))+) ([^#]+[^ #])(?: (#[a-zA-Z_]+))?$/i

const HELP_TEXT =
    'Invalid format. You need to send a message like `/repeat 1.99 Cake #food` to set up a recurring expense.'

function onRepeatDefault(bot) {
    return function (msg) {
        return bot.sendMessage(msg.chat.id, HELP_TEXT, {
            parse_mode: 'Markdown',
        })
    }
}

function onRepeat(bot) {
    return async function (msg, match) {
        const expenses = new ExpensesService(db)

        const amount = ExpensesService.parseAmount(match[1])
        const [description, category] = match.slice(2)

        if (!amount) {
            return bot.sendMessage(msg.chat.id, HELP_TEXT, {
                parse_mode: 'Markdown',
            })
        }

        try {
            await expenses.insert(
                new Expense(
                    null,
                    msg.chat.id,
                    amount,
                    description,
                    new Date(msg.date * 1000),
                    category,
                    true
                )
            )

            bot.sendMessage(
                msg.chat.id,
                'A new recurring expense has been scheduled and will first be counted next month. You can cancel it again using `/stop`.',
                { parse_mode: 'Markdown' }
            )
        } catch (e) {
            bot.sendMessage(
                msg.chat.id,
                'Sorry, something went wrong while setting up your recurring expense. Please try again.',
                { parse_mode: 'Markdown' }
            )

            console.error(
                `Failed to add recurring expense for user ${msg.chat.id}: ${e}`
            )
        }
    }
}

function register(bot) {
    console.log('Registering handlers for /repeat ...')
    bot.onText(PATTERN_DEFAULT, onRepeatDefault(bot))
    bot.onText(PATTERN_PARAMS, onRepeat(bot))
}

module.exports = {
    register,
}
