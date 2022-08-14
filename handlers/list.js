const db = require('../db'),
    ExpensesService = require('../services/expenses'),
    MONTHS = require('../constants').MONTHS

const PATTERN_DEFAULT = /^\/list$/i
const PATTERN_MONTH =
    /^\/list (january|february|match|april|may|june|july|august|september|october|november|december)$/i
const PATTERN_COMBINED =
    /^\/list (january|february|match|april|may|june|july|august|september|october|november|december) (#\w+)$/i

function onListDefault(bot) {
    return function (msg) {
        return bot.sendMessage(
            msg.chat.id,
            `Please specify a month to list the expenses for.\nE.g. you can type \`/list April\` to get expenses for April or \`/list April #food\``,
            {
                parse_mode: 'Markdown',
            }
        )
    }
}

function onListMonth(bot) {
    return async function (msg, match) {
        const text = await printExpenseList(msg.chat.id, match[1], null)
        bot.sendMessage(msg.chat.id, text, {
            parse_mode: 'Markdown',
        })
    }
}

function onListCombined(bot) {
    return async function (msg, match) {
        const text = await printExpenseList(msg.chat.id, match[1], match[2])
        bot.sendMessage(msg.chat.id, text, {
            parse_mode: 'Markdown',
        })
    }
}

async function printExpenseList(user, month, category) {
    const expenses = new ExpensesService(db)
    const result = await expenses.getMany(user, month, category)
    return result.join('\n')
}

function register(bot) {
    console.log('Registering handlers for /list ...')
    bot.onText(PATTERN_DEFAULT, onListDefault(bot))
    bot.onText(PATTERN_MONTH, onListMonth(bot))
    bot.onText(PATTERN_COMBINED, onListCombined(bot))
}

module.exports = {
    register,
}
