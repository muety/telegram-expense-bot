const Expense = require('./model/expense')
    , cfg = require('./config')
    , fs = require('fs')
    , os = require('os')
    , path = require('path')

function parseMessage(messageText) {
    if (/-*\d+\.\d+[a-zA-z\ ]+/.test(messageText)) {
        return [
            parseFloat(messageText.match(/-*\d+\.\d+/)),
            (messageText.match(/-*\d+\.\d+[a-zA-zäöüÄÖÜ\ ]+/)[0].match(/[a-zA-zäöüÄÖÜ\ ]+/)[0]).trim(),
            /#\w+/.test(messageText) ? messageText.match(/#\w+/)[0] : null
        ]
    }
    return false
}

function makeQuery(args, user) {
    if (!user) return false

    let date = new Date()
    let cat, from, to

    if (/^#\w+$/.test(args[0]) && !args[1]) {
        // /get #food
        from = new Date(date.getFullYear(), date.getMonth(), 1),
            to = new Date(date.getFullYear(), date.getMonth() + 1, 1),
            cat = args[0]
    } else if (/^[A-Za-z]+$/.test(args[0]) && !args[1]) {
        // /get january
        let capitalized = capitalize(args[0])

        if (cfg.MONTHS.hasOwnProperty(capitalized)) {
            from = new Date(date.getFullYear(), cfg.MONTHS[capitalized], 1),
                to = new Date(date.getFullYear(), cfg.MONTHS[capitalized] + 1, 1)
        } else if (cfg.WEEKDAYS.hasOwnProperty(capitalized)) {
            from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() - cfg.WEEKDAYS[capitalized])),
                to = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() - cfg.WEEKDAYS[capitalized]) + 1)
        }
    } else if (/^[A-Za-z]+$/.test(args[0]) && /^#\w+$/.test(args[1])) {
        // /get january #food
        let capitalized = capitalize(args[0])

        if (cfg.MONTHS.hasOwnProperty(capitalized)) {
            from = new Date(date.getFullYear(), cfg.MONTHS[capitalized], 1),
                to = new Date(date.getFullYear(), cfg.MONTHS[capitalized] + 1, 1)
        }
        else if (cfg.WEEKDAYS.hasOwnProperty(capitalized)) {
            from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() - cfg.WEEKDAYS[capitalized])),
                to = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() - cfg.WEEKDAYS[capitalized]) + 1)
        }
        cat = args[1]
    } else if (/^[A-Za-z]+$/.test(args[1]) && /^#\w+$/.test(args[0])) {
        // /get #food january
        let capitalized = capitalize(args[1])

        if (cfg.MONTHS.hasOwnProperty(capitalized)) {
            from = new Date(date.getFullYear(), cfg.MONTHS[capitalized], 1),
                to = new Date(date.getFullYear(), cfg.MONTHS[capitalized] + 1, 1)
        }
        else if (cfg.WEEKDAYS.hasOwnProperty(capitalized)) {
            from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() - cfg.WEEKDAYS[capitalized])),
                to = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() - cfg.WEEKDAYS[capitalized]) + 1)
        }
        cat = args[0]
    }

    return cat
        ? { timestamp: { $lt: to, $gte: from }, category: cat, user: user }
        : { timestamp: { $lt: to, $gte: from }, user: user }
}

function findExpenses(coll, message, args, callback) {
    let query = makeQuery(args, message.chat.id)
    if (!query) return callback(true, null)

    coll.find(query).toArray((err, all) => {
        if (err) return callback(err)
        let expenses = all.map(
            item => new Expense(
                item.user,
                item.amount.toFixed(2),
                item.description,
                item.timestamp,
                (item.category ? item.category : undefined)
            )
        )
        callback(null, expenses)
    })
}

function summarizeExpenses(coll, message, args, callback) {
    let query = makeQuery(args, message.chat.id)
    if (!query) return callback(true, null)

    const category = query.category
    delete query.category

    coll.aggregate([
        { $match: query },
        { $group: { _id: "$category", total: { $sum: "$amount" } } }
    ]).toArray((err, all) => {
        if (err) return callback(err)

        all = all.filter(e => !category || e._id === category)
        all = all.map(e => Object.assign(e, { _id: e._id || 'uncategorized', total: e.total.toFixed(2) }))
        all.sort((e1, e2) => e1._id.localeCompare(e2._id))

        callback(null, all)
    })
}

function deleteExpenses(coll, message, args, callback) {
    let query = makeQuery(args, message.chat.id)
    if (!query) return callback(true, null)
    coll.remove(query, callback)
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function asCsv(expenses) {
    const header = `amount,description,category,date,timestamp`
    const body = expenses
        .map(e => [e.amount, e.description, e.category, e.timestamp, e.timestamp.getTime()].join(','))
        .join('\n')
    return `${header}\n${body}`
}

function writeTempFile(fileName, content) {
    const filePath = path.join(os.tmpdir(), fileName)
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, content, err => {
            if (err) {
                return reject(err)
            }
            return resolve(filePath)
        })
    })
}

function deleteFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, err => {
            if (err) {
                return reject(err)
            }
            return resolve()
        })
    })
}

module.exports = {
    parseMessage,
    findExpenses,
    summarizeExpenses,
    deleteExpenses,
    makeQuery,
    capitalize,
    asCsv,
    writeTempFile,
    deleteFile
}
