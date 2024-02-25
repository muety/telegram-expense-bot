const db = require('../db'),
    wrapAsync = require('../utils').wrapAsync,
    ExpensesService = require('../services/expenses')

const PATTERN_DEFAULT = /^\/reset$/i
const PATTERN_MONTH = /^\/reset (january|february|march|april|may|june|july|august|september|october|november|december)$/i
const PATTERN_CATEGORY = /^\/reset (#\w+)$/i
const PATTERN_DATE = /^\/reset (\d{4}-\d{2}-\d{2})$/i

const expenseService = new ExpensesService(db)

function onResetDefault(bot) {
    return async function (msg) {
        await bot.sendMessage(
            msg.chat.id,
            `Please specify a month or category to reset the expenses for.\nE.g. you can type \`/reset April\` to remove expenses for April or \`/reset #food\``,
            { parse_mode: 'Markdown' }
        )
    }
}

function onResetDate(bot) {
    return async function (msg, match) {
        try {
            await expenseService.clear(msg.chat.id, null, null, match[1])
            await bot.sendMessage(msg.chat.id, `🗑 Deleted all expenses for ${match[1]}`, { parse_mode: 'Markdown' })
        } catch (e) {
            console.error(`Failed to clear day-specific expenses for user ${msg.chat.id}: ${e}`)
            await bot.sendMessage(msg.chat.id, 'Something went wrong, sorry 😕')
        }
    }
}

function onResetMonth(bot) {
    return async function (msg, match) {
        try {
            await expenseService.clear(msg.chat.id, match[1], null)
            await bot.sendMessage(msg.chat.id, `🗑 Deleted all expenses for ${match[1]}`, { parse_mode: 'Markdown' })
        } catch (e) {
            console.error(`Failed to clear monthly expenses for user ${msg.chat.id}: ${e}`)
            await bot.sendMessage(msg.chat.id, 'Something went wrong, sorry 😕')
        }
    }
}

function onResetCategory(bot) {
    return async function (msg, match) {
        try {
            await expenseService.clear(msg.chat.id, null, match[1])
            await bot.sendMessage(msg.chat.id, `🗑 Deleted all expenses for ${match[1]}`, { parse_mode: 'Markdown' })
        } catch (e) {
            console.error(`Failed to clear category expenses for user ${msg.chat.id}: ${e}`)
            await bot.sendMessage(msg.chat.id, 'Something went wrong, sorry 😕')
        }
    }
}

function register(bot, middleware) {
    console.log('✅ Registering handlers for /reset ...')
    bot.onText(PATTERN_DEFAULT, middleware(wrapAsync(onResetDefault(bot))))
    bot.onText(PATTERN_MONTH, middleware(wrapAsync(onResetMonth(bot))))
    bot.onText(PATTERN_CATEGORY, middleware(wrapAsync(onResetCategory(bot))))
    bot.onText(PATTERN_DATE, middleware(wrapAsync(onResetDate(bot))))
}

module.exports = {
    register,
}
