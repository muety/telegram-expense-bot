const cron = require('node-cron')
    , db = require('./db')
    , utils = require('./utils')
    , Expense = require('./model/expense')

const defaultJobs = [
    ['1 0 1 * *', recurringExpensesJob]
]

// insert recurring expenses at the first of every month
function recurringExpensesJob(bot) {
    return async () => {
        console.log('[job] Syncing recurring expenses.')

        const date = new Date()
        const coll = db.getCollection()
        const from = new Date(date.getFullYear(), date.getMonth(), 1)
        const to = new Date(date.getFullYear(), date.getMonth() + 1, 1)

        const existingRefs = new Set(await (new Promise((resolve, reject) => {
            coll
                .find({
                    ref: { $exists: true },
                    timestamp: { $lt: to, $gte: from }
                }, {
                    projection: { ref: 1, _id: 0 }
                })
                .toArray((err, expenses) => {
                    if (err) return reject(err)
                    resolve(
                        expenses.map(e => e.ref.toString())
                    )
                })
        })) || [])

        const allTemplates = await new Promise((resolve, reject) => {
            coll
                .find({
                    isTemplate: true
                }, {
                    projection: { isTemplate: 0 }
                })
                .toArray((err, templates) => {
                    if (err) return reject(err)
                    resolve(templates)
                })
        })

        const newExpenses = allTemplates
            .filter(t => !existingRefs.has(t._id.toString()))
            .map(t => new Expense(
                t.user,
                t.amount,
                t.description,
                new Date(),
                t.category,
                t._id.toString()
            ))

        if (newExpenses.length) {
            coll.insertMany(newExpenses, (err, ok) => {
                if (err) return console.error(err)
                console.log(`[job] Inserted ${newExpenses.length} new expenses.`)
            })
        } else {
            console.log('[job] Nothing to do.')
        }
    }
}

function scheduleDefault(bot) {
    defaultJobs.forEach(e => cron.schedule(e[0], e[1](bot)))
}

function runDefault(bot) {
    defaultJobs.forEach(e => e[1](bot)())
}

module.exports = {
    scheduleDefault,
    runDefault
}