const db = require('../db'),
    utils = require('../utils'),
    wrapAsync = require('../utils').wrapAsync,
    ExpensesService = require('../services/expenses')

const PATTERN_DEFAULT = /^\/export$/i
const PATTERN_MONTH =
    /^\/export (january|february|march|april|may|june|july|august|september|october|november|december)$/i

const expenseService = new ExpensesService(db)

function onExportDefault(bot) {
    return async function (msg) {
        return await bot.sendMessage(
            msg.chat.id,
            `Please specify a month to download the expenses for.\nE.g. you can type \`/export April\` to get expenses for April`,
            { parse_mode: 'Markdown' }
        )
    }
}

function onExportMonth(bot) {
    return async function (msg, match) {
        const expenses = await expenseService.list(msg.chat.id, match[1])
        const csvData = printCsv(expenses)

        try {
            // TODO: send directly from stream / buffer, without writing to file
            const filePath = await utils.writeTempFile(
                `expenses_${msg.chat.id}_${utils.capitalize(match[1])}.csv`,
                csvData
            )
            await bot.sendDocument(msg.chat.id, filePath, {
                caption: `CSV export of your expenses for ${utils.capitalize(match[1])}`,
            })
            await utils.deleteFile(filePath)
        } catch (e) {
            console.error(`Failed to export expenses for user ${msg.chat.id}: ${e}`)
            await bot.sendMessage(msg.chat.id, 'Something went wrong, sorry 😕')
        }
    }
}

function printCsv(expenses) {
    const header = `amount,description,category,date,timestamp`
    const body = expenses
        .map((e) => [e.amount, e.description, e.category, e.timestamp, e.timestamp.getTime()].join(','))
        .join('\n')
    return `${header}\n${body}`
}

function register(bot, middleware) {
    console.log('✅ Registering handlers for /export ...')
    bot.onText(PATTERN_DEFAULT, middleware(wrapAsync(onExportDefault(bot))))
    bot.onText(PATTERN_MONTH, middleware(wrapAsync(onExportMonth(bot))))
}

module.exports = {
    register,
}
