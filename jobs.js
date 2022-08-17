const cron = require('node-cron'),
    db = require('./db'),
    Expense = require('./model/expense'),
    ExpensesService = require('./services/expenses')

const defaultJobs = [['1 0 1 * *', recurringExpensesJob]]

const expenseService = new ExpensesService(db)

// insert recurring expenses at the first of every month
function recurringExpensesJob(bot) {
    return async () => {
        console.log('⚙️ Syncing recurring expenses ...')

        const date = new Date()
        const from = new Date(date.getFullYear(), date.getMonth(), 1)
        const to = new Date(date.getFullYear(), date.getMonth() + 1, 1)

        const existingRefs = new Set(
            (
                await expenseService.findRaw(
                    {
                        ref: { $exists: true },
                        timestamp: { $lt: to, $gte: from },
                    },
                    {
                        projection: { ref: 1, _id: 0 },
                    },
                    false
                )
            ).map((e) => e.ref.toString())
        )

        const allTemplates = await expenseService.findRaw(
            {
                isTemplate: true,
                timestamp: { $lt: from },
            },
            {
                projection: { isTemplate: 0 },
            },
            false
        )

        const newExpenses = allTemplates
            .filter((t) => !existingRefs.has(t._id.toString()))
            .map(
                (t) => new Expense(null, t.user, t.amount, t.description, date, t.category, undefined, t._id.toString())
            )

        if (newExpenses.length) {
            try {
                await expenseService.insertMany(newExpenses)
                console.log(`⚙️ Inserted ${newExpenses.length} new expenses.`)
            } catch (e) {
                console.error(`⚙️ Failed to insert new expenses from templates: ${e}.`)
            }
        } else {
            console.log('⚙️ Nothing to do.')
        }
    }
}

function scheduleDefault(bot) {
    defaultJobs.forEach((e) => cron.schedule(e[0], e[1](bot)))
}

async function runDefault(bot) {
    await Promise.all([defaultJobs.map((e) => e[1](bot)())])
}

module.exports = {
    scheduleDefault,
    runDefault,
}
