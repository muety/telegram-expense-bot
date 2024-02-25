const db = require('../db'),
    wrapAsync = require('../utils').wrapAsync,
    sendSplit = require('../utils').sendSplit,
    ExpensesService = require('../services/expenses'),
    KeyValueService = require('../services/keyValue')

const PATTERN_DEFAULT = /^\/list$/i
const PATTERN_MONTH = /^\/list (january|february|march|april|may|june|july|august|september|october|november|december)$/i
const PATTERN_COMBINED = /^\/list (january|february|march|april|may|june|july|august|september|october|november|december) (#\w+)$/i
const PATTERN_DATE = /^\/list (\d{4}-\d{2}-\d{2})$/i

const expenseService = new ExpensesService(db)
const keyValueService = new KeyValueService(db)

function onListDefault(bot) {
    return async function (msg) {
        await bot.sendMessage(
            msg.chat.id,
            `Please specify a month to list the expenses for.\nE.g. you can type \`/list April\` to get expenses for April or \`/list April #food\``,
            { parse_mode: 'Markdown' }
        )
    }
}

function onListDate(bot) {
    return async function (msg, match) {
        try {
            const text = await printExpenseList(msg.chat.id, null, null, match[1])
            return await sendSplit(bot, msg.chat.id, text, { parse_mode: 'Markdown' })
        } catch (e) {
            console.error(`Failed to list day-specific expenses for uer ${msg.chat.id}: ${e}`)
            await bot.sendMessage(msg.chat.id, 'Something went wrong, sorry 😕')
        }
    }
}

function onListMonth(bot) {
    return async function (msg, match) {
        try {
            const text = await printExpenseList(msg.chat.id, match[1], null)
            return await sendSplit(bot, msg.chat.id, text, { parse_mode: 'Markdown' })
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
            return await sendSplit(bot, msg.chat.id, text, { parse_mode: 'Markdown' })
        } catch (e) {
            console.error(`Failed to list combined expenses for uer ${msg.chat.id}: ${e}`)
            await bot.sendMessage(msg.chat.id, 'Something went wrong, sorry 😕')
        }
    }
}

async function printExpenseList(user, month, category, date) {
    const userTz = await keyValueService.getUserTz(user)
    const expenses = (await expenseService.list(user, month, category, date)).map(e => e.toString(false, userTz))
    return expenses.length ? expenses.join('\n') : '🙅‍♂️ No expenses for this month'
}

function register(bot, middleware) {
    console.log('✅ Registering handlers for /list ...')
    bot.onText(PATTERN_DEFAULT, middleware(wrapAsync(onListDefault(bot))))
    bot.onText(PATTERN_MONTH, middleware(wrapAsync(onListMonth(bot))))
    bot.onText(PATTERN_COMBINED, middleware(wrapAsync(onListCombined(bot))))
    bot.onText(PATTERN_DATE, middleware(wrapAsync(onListDate(bot))))
}

module.exports = {
    register,
}
