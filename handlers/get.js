const db = require('../db'),
    wrapAsync = require('../utils').wrapAsync,
    ExpensesService = require('../services/expenses'),
    MONTHS = require('../constants').MONTHS

const PATTERN_DEFAULT = /^\/get$/i
const PATTERN_MONTH = /^\/get (january|february|march|april|may|june|july|august|september|october|november|december)$/i
const PATTERN_CATEGORY = /^\/get (#\w+)$/i
const PATTERN_COMBINED = /^\/get (january|february|march|april|may|june|july|august|september|october|november|december) (#\w+)$/i
const PATTERN_DATE = /^\/get (\d{4}-\d{2}-\d{2})$/i
const PATTERN_MONTH_PLAIN = /^(january|february|march|april|may|june|july|august|september|october|november|december)$/i
const PATTERN_CATEGORY_PLAIN = /^(#\w+)$/i

const expenseService = new ExpensesService(db)

function onGetDefault(bot) {
    return async function (msg) {
        const keyboard = []
        for (let i = 0; i < 4; i++) {
            keyboard[i] = MONTHS.slice(i * 3, i * 3 + 3)
        }

        return await bot.sendMessage(msg.chat.id, 'Select a month to view expenses for.', {
            reply_markup: { keyboard },
        })
    }
}

function onGetDate(bot, matchIdx) {
    return async function (msg, match) {
        try {
            const text = await printExpenseSummary(msg.chat.id, null, null, match[matchIdx || 1])
            await bot.sendMessage(msg.chat.id, text, {
                parse_mode: 'Markdown',
                reply_markup: { remove_keyboard: true },
            })
        } catch (e) {
            console.error(`Failed to get day-specific expenses for user ${msg.chat.id}: ${e}`)
            await bot.sendMessage(msg.chat.id, 'Something went wrong, sorry 😕')
        }
    }
}

function onGetMonth(bot, matchIdx) {
    return async function (msg, match) {
        try {
            const text = await printExpenseSummary(msg.chat.id, match[matchIdx || 1], null)
            await bot.sendMessage(msg.chat.id, text, {
                parse_mode: 'Markdown',
                reply_markup: { remove_keyboard: true },
            })
        } catch (e) {
            console.error(`Failed to get monthly expenses for user ${msg.chat.id}: ${e}`)
            await bot.sendMessage(msg.chat.id, 'Something went wrong, sorry 😕')
        }
    }
}

function onGetCategory(bot, matchIdx) {
    return async function (msg, match) {
        try {
            const text = await printExpenseSummary(msg.chat.id, null, match[matchIdx || 1])
            await bot.sendMessage(msg.chat.id, text, {
                parse_mode: 'Markdown',
                reply_markup: { remove_keyboard: true },
            })
        } catch (e) {
            console.error(`Failed to get category expenses for user ${msg.chat.id}: ${e}`)
            await bot.sendMessage(msg.chat.id, 'Something went wrong, sorry 😕')
        }
    }
}

function onGetCombined(bot) {
    return async function (msg, match) {
        try {
            const text = await printExpenseSummary(msg.chat.id, match[1], match[2])
            await bot.sendMessage(msg.chat.id, text, {
                parse_mode: 'Markdown',
                reply_markup: { remove_keyboard: true },
            })
        } catch (e) {
            console.error(`Failed to get combined expenses for user ${msg.chat.id}: ${e}`)
            await bot.sendMessage(msg.chat.id, 'Something went wrong, sorry 😕')
        }
    }
}

async function printExpenseSummary(user, month, category, date) {
    const expenses = await expenseService.summarize(user, month, category, date)
    const total = expenses.reduce((acc, val) => (acc += parseFloat(val.total)), 0).toFixed(2)

    let text = `You've spent a total of *${total}*.\n\n`
    text += expenses.map((e) => `${e._id} – ${e.total}`).join('\n')

    return text
}

function register(bot, middleware) {
    console.log('✅ Registering handlers for /get ...')
    bot.onText(PATTERN_DEFAULT, middleware(wrapAsync(onGetDefault(bot))))
    bot.onText(PATTERN_DATE, middleware(wrapAsync(onGetDate(bot))))
    bot.onText(PATTERN_MONTH, middleware(wrapAsync(onGetMonth(bot))))
    bot.onText(PATTERN_CATEGORY, middleware(wrapAsync(onGetCategory(bot))))
    bot.onText(PATTERN_COMBINED, middleware(wrapAsync(onGetCombined(bot))))
    bot.onText(PATTERN_MONTH_PLAIN, middleware(wrapAsync(onGetMonth(bot, 0))))
    bot.onText(PATTERN_CATEGORY_PLAIN, middleware(wrapAsync(onGetCategory(bot, 0))))
}

module.exports = {
    register,
}
