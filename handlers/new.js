const Expense = require('../model/expense')

const db = require('../db'),
    ExpensesService = require('../services/expenses')

const PATTERN_DEFAULT = /^\/new$/i
const PATTERN_PARAMS =
    /^\/new ((?:(?:\-?[0-9]+(?:\.[0-9]{0,2})?)|(?:[\+\-\*\/\s]))+) ([^#]+[^ #])(?: (#[a-zA-Z_]+))?$/i
const PATTERN_PLAIN =
    /^((?:(?:\-?[0-9]+(?:\.[0-9]{0,2})?)|(?:[\+\-\*\/\s]))+) ([^#]+[^ #])(?: (#[a-zA-Z_]+))?$/i

const HELP_TEXT = `Sorry, your command must look like this: \`/new 1.99 Lunch\`\nOptionally you could also specify a category using a hash tag like this:\`/new 1.99 Lunch #food\`. You can also simply leave out the \`/new\` and only type \`1.99 Lunch #food.\``

function onNewDefault(bot) {
    return function (msg) {
        return bot.sendMessage(msg.chat.id, HELP_TEXT, {
            parse_mode: 'Markdown',
        })
    }
}

function onNew(bot) {
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
                    category
                )
            )

            bot.sendMessage(msg.chat.id, `✅ Added *${amount}*.`, {
                parse_mode: 'Markdown',
            })
        } catch (e) {
            bot.sendMessage(
                msg.chat.id,
                '❌ Sorry, something went wrong while saving your expense. Please try again.',
                {
                    parse_mode: 'Markdown',
                }
            )

            console.error(`Failed to add expense for user ${msg.chat.id}: ${e}`)
        }
    }
}

function register(bot) {
    console.log('Registering handlers for /new ...')
    bot.onText(PATTERN_DEFAULT, onNewDefault(bot))
    bot.onText(PATTERN_PARAMS, onNew(bot))
    bot.onText(PATTERN_PLAIN, onNew(bot))
}

module.exports = {
    register,
}
