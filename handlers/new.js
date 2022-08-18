const Expense = require('../model/expense')

const db = require('../db'),
    wrapAsync = require('../utils').wrapAsync,
    ExpensesService = require('../services/expenses')

const PATTERN_DEFAULT = /^\/new$/i
const PATTERN_PARAMS = /^\/new ((?:(?:\-?[0-9]+(?:\.[0-9]{0,2})?)|(?:[\+\-\*\/\s]))+) ([^#]+[^ #])(?: (#[a-zA-Z_]+))?$/i
const PATTERN_PLAIN = /^((?:(?:\-?[0-9]+(?:\.[0-9]{0,2})?)|(?:[\+\-\*\/\s]))+) ([^#]+[^ #])(?: (#[a-zA-Z_]+))?$/i

const HELP_TEXT = `Sorry, your command must look like this: \`/new 1.99 Lunch\`\nOptionally you could also specify a category using a hash tag like this:\`/new 1.99 Lunch #food\`. You can also simply leave out the \`/new\` and only type \`1.99 Lunch #food.\``

const expenseService = new ExpensesService(db)

function onNewDefault(bot) {
    return async function (msg) {
        return await bot.sendMessage(msg.chat.id, HELP_TEXT, { parse_mode: 'Markdown' })
    }
}

function onNew(bot) {
    return async function (msg, match) {
        const amount = ExpensesService.parseAmount(match[1])
        const [description, category] = match.slice(2)

        if (!amount) {
            return await bot.sendMessage(msg.chat.id, HELP_TEXT, { parse_mode: 'Markdown' })
        }

        try {
            await expenseService.insert(
                new Expense(null, msg.chat.id, amount, description, new Date(msg.date * 1000), category)
            )

            await bot.sendMessage(msg.chat.id, `✅ Added *${amount}*.`, { parse_mode: 'Markdown' })
        } catch (e) {
            console.error(`Failed to add expense for user ${msg.chat.id}: ${e}`)
            await bot.sendMessage(
                msg.chat.id,
                '❌ Sorry, something went wrong while saving your expense. Please try again.',
                { parse_mode: 'Markdown' }
            )
        }
    }
}

function register(bot, middleware) {
    console.log('✅ Registering handlers for /new ...')
    bot.onText(PATTERN_DEFAULT, middleware(wrapAsync(onNewDefault(bot))))
    bot.onText(PATTERN_PARAMS, middleware(wrapAsync(onNew(bot))))
    bot.onText(PATTERN_PLAIN, middleware(wrapAsync(onNew(bot))))
}

module.exports = {
    register,
}
