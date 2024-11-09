const os = require('os'),
    path = require('path'),
    db = require('../db'),
    utils = require('../utils'),
    wrapAsync = require('../utils').wrapAsync,
    ExpensesService = require('../services/expenses')

const PATTERN_DEFAULT = /^\/export$/i
const PATTERN_MONTH =
    /^\/export (january|february|march|april|may|june|july|august|september|october|november|december|all)$/i

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
        const expenses = match[1] === 'all'
            ? await expenseService.listAll(msg.chat.id)
            : await expenseService.list(msg.chat.id, match[1])
        const csvData = printCsv(expenses)

        try {
            // TODO: send directly from stream / buffer, without writing to file
            let csvFileName = `expenses_${msg.chat.id}_${match[1]}.csv`
            let zipFileName = `${csvFileName}.zip`
            let csvPath = await utils.writeTempFile(csvFileName, csvData)
            let zipPath = true ? await utils.zipFile(csvPath, path.join(os.tmpdir(), zipFileName)) : null

            await bot.sendDocument(msg.chat.id, zipPath || csvPath, {
                caption: `CSV export of your expenses for ${utils.capitalize(match[1])}`,
            })

            if (csvPath) await utils.deleteFile(csvPath)
            if (zipPath) await utils.deleteFile(zipPath)
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
