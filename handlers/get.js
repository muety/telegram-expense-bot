const db = require('../db'),
    ExpensesService = require('../services/expenses'),
    MONTHS = require('../constants').MONTHS

const PATTERN_DEFAULT = /^\/get$/i
const PATTERN_MONTH =
    /^\/get (january|february|match|april|may|june|july|august|september|october|november|december)$/i
const PATTERN_CATEGORY = /^\/get (#\w+)$/i
const PATTERN_COMBINED =
    /^\/get (january|february|match|april|may|june|july|august|september|october|november|december) (#\w+)$/i
const PATTERN_MONTH_PLAIN = /^(january|february|match|april|may|june|july|august|september|october|november|december)$/i
const PATTERN_CATEGORY_PLAIN = /^(#\w+)$/i

function onGetDefault(bot) {
    return function (msg) {
        const keyboard = []
        for (let i = 0; i < 4; i++) {
            keyboard[i] = MONTHS.slice(i*3, i*3+3)
        }

        return bot.sendMessage(
            msg.chat.id,
            'Select a month to view expenses for.',
            {
                reply_markup: { keyboard },
            }
        )
    }
}

function onGetMonth(bot, matchIdx) {
    return async function (msg, match) {
        const text = await printExpenseSummary(msg.chat.id, match[matchIdx || 1], null)
        bot.sendMessage(msg.chat.id, text, {
            parse_mode: 'Markdown',
            reply_markup: { remove_keyboard: true },
        })
    }
}

function onGetCategory(bot, matchIdx) {
    return async function (msg, match) {
        const text = await printExpenseSummary(msg.chat.id, null, match[matchIdx || 1])
        bot.sendMessage(msg.chat.id, text, {
            parse_mode: 'Markdown',
            reply_markup: { remove_keyboard: true },
        })
    }
}

function onGetCombined(bot) {
    return async function (msg, match) {
        const text = await printExpenseSummary(msg.chat.id, match[1], match[2])
        bot.sendMessage(msg.chat.id, text, {
            parse_mode: 'Markdown',
            reply_markup: { remove_keyboard: true },
        })
    }
}

async function printExpenseSummary(user, month, category) {
    const expenses = new ExpensesService(db)

    const result = await expenses.summarizeMany(user, month, category)

    const total = result
        .reduce((acc, val) => (acc += parseFloat(val.total)), 0)
        .toFixed(2)

    let text = `You've spent a total of *${total}*.\n\n`
    text += result.map((e) => `${e._id} – ${e.total}`).join('\n')

    return text
}

function register(bot) {
    console.log('Registering handlers for /get ...')
    bot.onText(PATTERN_DEFAULT, onGetDefault(bot))
    bot.onText(PATTERN_MONTH, onGetMonth(bot))
    bot.onText(PATTERN_CATEGORY, onGetCategory(bot))
    bot.onText(PATTERN_COMBINED, onGetCombined(bot))
    bot.onText(PATTERN_MONTH_PLAIN, onGetMonth(bot, 0))
    bot.onText(PATTERN_CATEGORY_PLAIN, onGetCategory(bot, 0))
}

module.exports = {
    register,
}
