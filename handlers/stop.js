const db = require('../db'),
    ExpensesService = require('../services/expenses'),
    wrapAsync = require('../utils').wrapAsync,
    MONTHS = require('../constants').MONTHS

const PATTERN_DEFAULT = /^\/stop$/i
const PATTERN_PARAMS = /^\/stop (\d+)$/i

const expenseService = new ExpensesService(db)

function onStopDefault(bot) {
    return async function (msg) {
        const result = await expenseService.listRecurring(msg.chat.id)
        const text = `Please send \`/stop\` alongside the number of the expense to stop, e.g. \`/stop 1\`. The following recurring expenses are currently active: \n\n${printExpenses(
            result
        )}`
        await bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' })
    }
}

function onStop(bot) {
    return async function (msg, match) {
        const index = parseInt(match[1])

        const result = await expenseService.listRecurring(msg.chat.id)
        if (!index || index > result.length) {
            return await bot.sendMessage(message.chat.id, `Invalid command, sorry 😕`, { parse_mode: 'Markdown' })
        }

        try {
            await expenseService.delete(result[index - 1].id)
            result.splice(index - 1, 1)

            const text = `Recurring expense cancelled. The following are still active:\n\n${printExpenses(result)}`
            await bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' })
        } catch (e) {
            console.error(`Failed to stop recurring expense of user ${msg.chat.id}: ${e}`)
            await bot.sendMessage(msg.chat.id, 'Something went wrong, sorry 😕', { parse_mode: 'Markdown' })
        }
    }
}

function printExpenses(expenses) {
    if (!expenses.length) return '_none_'
    return expenses.map((t, i) => `**${i + 1}** – ${t.toString(true)}`).join('\n')
}

function register(bot, middleware) {
    console.log('✅ Registering handlers for /stop ...')
    bot.onText(PATTERN_DEFAULT, middleware(wrapAsync(onStopDefault(bot))))
    bot.onText(PATTERN_PARAMS, middleware(wrapAsync(onStop(bot))))
}

module.exports = {
    register,
}
