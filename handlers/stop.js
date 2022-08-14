const Expense = require('../model/expense')

const db = require('../db'),
    ExpensesService = require('../services/expenses'),
    MONTHS = require('../constants').MONTHS

const PATTERN_DEFAULT = /^\/stop$/i
const PATTERN_PARAMS = /^\/stop (\d+)$/i

function onStopDefault(bot) {
    return async function (msg) {
        const expenses = new ExpensesService(db)

        const result = await expenses.listRecurring(msg.chat.id)
        const text = `Please send \`/stop\` alongside the number of the expense to stop, e.g. \`/stop 1\`. The following recurring expenses are currently active: \n\n${printExpenses(result)}`
        return bot.sendMessage(msg.chat.id, text, {
            parse_mode: 'Markdown',
        })
    }
}

function onStop(bot) {
    return async function (msg, match) {
        const expenses = new ExpensesService(db)

        const index = parseInt(match[1])

        const result = await expenses.listRecurring(msg.chat.id)
        if (!index || index > result.length) {
            return bot.sendMessage(
                message.chat.id,
                `Invalid command, sorry 😕`,
                { parse_mode: 'Markdown' }
            )
        }

        try {
            await expenses.delete(result[index - 1].id)
            result.splice(index - 1, 1)

            const text = `Recurring expense cancelled. The following are still active:\n\n${printExpenses(result)}`

            bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' })
        } catch (e) {
            bot.sendMessage(msg.chat.id, 'Something went wrong, sorry.', {
                parse_mode: 'Markdown',
            })
            console.error(
                `Failed to stop recurring expense of user ${msg.chat.id}: ${e}`
            )
        }
    }
}

function printExpenses(expenses) {
    if (!expenses.length) return '_none_'
    return expenses.map((t, i) => `**${i + 1}** – ${t.toString(true)}`).join('\n')
}

function register(bot) {
    console.log('Registering handlers for /stop ...')
    bot.onText(PATTERN_DEFAULT, onStopDefault(bot))
    bot.onText(PATTERN_PARAMS, onStop(bot))
}

module.exports = {
    register,
}
