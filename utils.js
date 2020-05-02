const Expense = require('./model/expense')
    , cfg = require('./config')
    , _ = require('lodash')

function parseMessage(messageText) {
    if (/-*\d+\.\d+[a-zA-z\ ]+/.test(messageText)) {
        return [
            parseFloat(messageText.match(/-*\d+\.\d+/)),
            _.trim(messageText.match(/-*\d+\.\d+[a-zA-z\ ]+/)[0].match(/[a-zA-z\ ]+/)[0]),
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
        let expenses = []
        _(all).forEach((item) => {
            expenses.push(new Expense(item.user, item.amount.toFixed(2), item.description, item.timestamp, (item.category ? item.category : undefined)))
        })
        callback(null, expenses)
    })
}

function sumExpenses(coll, message, args, callback) {
    let query = makeQuery(args, message.chat.id)
    if (!query) return callback(true, null)

    coll.aggregate([
        { $match: query },
        { $group: { _id: "$user", total: { $sum: "$amount" } } }
    ]).toArray((err, all) => {
        if (err) return callback(err)
        if (all.length !== 1) return callback(true)

        callback(null, all[0].total.toFixed(2))
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

module.exports = {
    parseMessage,
    findExpenses,
    sumExpenses,
    deleteExpenses,
    makeQuery,
    capitalize
}
