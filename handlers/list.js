const db = require('../db'),
    ExpensesService = require('../services/expenses'),
    MONTHS = require('../constants').MONTHS

const PATTERN_DEFAULT = /^\/list$/i
const PATTERN_MONTH =
    /^\/list (january|february|match|april|may|june|july|august|september|october|november|december)$/i
const PATTERN_COMBINED =
    /^\/list (january|february|match|april|may|june|july|august|september|october|november|december) (#\w+)$/i

const expenseService = new ExpensesService(db)

function onListDefault(bot) {
    return async function (msg) {
        await bot.sendMessage(
            msg.chat.id,
            `Please specify a month to list the expenses for.\nE.g. you can type \`/list April\` to get expenses for April or \`/list April #food\``,
            { parse_mode: 'Markdown' }
        )
    }
}

function onListMonth(bot) {
    return async function (msg, match) {
        try {
            const text = await printExpenseList(msg.chat.id, match[1], null)
            await bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' })
        } catch (e) {
            console.error(`Failed to list monthly expenses for uer ${msg.chat.id}: ${e}`)
            await bot.sendMessage(msg.chat.id, 'Something went wrong, sorry 😕')
        }
    }
}

function onListCombined(bot) {
    return async function (msg, match) {
        try {
            const text = await printExpenseList(msg.chat.id, match[1], match[2])
            await bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' })
        } catch (e) {
            console.error(`Failed to list combined expenses for uer ${msg.chat.id}: ${e}`)
            await bot.sendMessage(msg.chat.id, 'Something went wrong, sorry 😕')
        }
    }
}

async function printExpenseList(user, month, category) {
    const expenses = await expenseService.getMany(user, month, category)
    return expenses.join('\n')
}

function register(bot) {
    console.log('✅ Registering handlers for /list ...')
    bot.onText(PATTERN_DEFAULT, onListDefault(bot))
    bot.onText(PATTERN_MONTH, onListMonth(bot))
    bot.onText(PATTERN_COMBINED, onListCombined(bot))
}

module.exports = {
    register,
}
