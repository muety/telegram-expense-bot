const cron = require('node-cron'),
    moment = require('moment-timezone'),
    db = require('./db'),
    Expense = require('./model/expense'),
    ExpensesService = require('./services/expenses'),
    KeyVaueService = require('./services/keyValue')

const defaultJobs = [['1 */6 * * *', recurringExpensesJob]]  // run every 6 hours

const expenseService = new ExpensesService(db)
const keyValueService = new KeyVaueService(db)

// insert recurring expenses at the first of every month
// will insert a recurring expense for every template that is "due", i.e. where "now > <user's first day of month>"
function recurringExpensesJob(bot) {
    return async () => {
        console.log('⚙️ Syncing recurring expenses ...')

        let newExpenses = []

        // fetch all expense templates
        const allTemplates = await expenseService.findRaw(
            {
                isTemplate: true,
                timestamp: { $lt: new Date() },
            },
            {
                projection: { isTemplate: 0 },
            },
            false
        )

        // extract unique set of users (who have existing templates)
        const users = new Set(allTemplates.map(t => t.user))

        for (let user of users) {
            const userTemplates = allTemplates.filter(t => t.user === user)

            const userTz = await keyValueService.getUserTz(user)
            const monthStart = moment.tz(new Date(), userTz).startOf('month')
            const monthEnd = monthStart.clone().endOf('month')

            // fetch already existing (previously inserted) recurring expenses for the user's month
            const existingRefs = new Set((await expenseService.findRaw(
                {
                    ref: { $exists: true },
                    ref: { $ne: null },
                    timestamp: {
                        $lt: monthEnd.toDate(),
                        $gte: monthStart.toDate()
                    },
                    user
                },
                {
                    projection: { ref: 1, _id: 0 },
                },
                false
            )).map((e) => e.ref.toString()))

            const newUserExpenses = userTemplates
                .filter((t) => !existingRefs.has(t._id.toString()))
                .filter((t) => moment(t.timestamp) < monthStart)  // don't insert recurring expenses before they even existed
                .map(
                    (t) => new Expense(null, t.user, t.amount, t.description, monthStart.add(1, 's').toDate(), t.category, undefined, t._id.toString())
                )

            newExpenses = newExpenses.concat(newUserExpenses)
        }

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
