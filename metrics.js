'use strict'

const prom = require('prom-client'),
    Gauge = prom.Gauge,
    register = prom.register,
    db = require('./db')

const prefix = 'telegram_expensebot_'

prom.collectDefaultMetrics({
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    prefix
})

const gTotalExpenses = new Gauge({
    name: `${prefix}expenses_total`,
    help: 'Total number of tracked expenses',
    labelNames: [],
    async collect() {
        const count = await db.getCollection().estimatedDocumentCount()
        this.set(count)
    }
})

const gTotalUsers = new Gauge({
    name: `${prefix}users_total`,
    help: 'Total number of registered users',
    labelNames: [],
    async collect() {
        const result = await db.getCollection()
            .aggregate([
                { $group: { _id: "$user" } },
                { $group: { _id: null, count: { $sum: 1 } } }
            ])
            .toArray()

        if (result.length === 1) this.set(result[0].count)
        else this.set(0)
    }
})

const gTotalCategories = new Gauge({
    name: `${prefix}categories_total`,
    help: 'Total number of different registered categories',
    labelNames: [],
    async collect() {
        const result = await db.getCollection()
            .aggregate([
                { $group: { _id: "$category" } },
                { $group: { _id: null, count: { $sum: 1 } } }
            ])
            .toArray()

        if (result.length === 1) this.set(result[0].count)
        else this.set(0)
    }
})

const gTotalAmount = new Gauge({
    name: `${prefix}amount_total`,
    help: 'Total amount of money currently tracked with the expense bot',
    labelNames: [],
    async collect() {
        const result = await db.getCollection()
            .aggregate([
                { $match: { $and: [{ amount: { $gte: -10000 } }, { amount: { $lte: 10000 } }] } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ])
            .toArray()

        if (result.length === 1) this.set(result[0].total)
        else this.set(0)
    }
})

module.exports = register