const MONTHS_LOWER = require('../constants').MONTHS_LOWER,
    Expense = require('../model/expense'),
    safeEval = require('safe-eval-2')

const AMOUNT_PATTERN = /^(\-?[0-9]+(?:\.[0-9]{0,2})?)$/g

class ExpensesService {
    constructor(db) {
        this.db = db
    }

    async list(user, month, category) {
        if (!user) throw new Error('user missing')

        const data = await this.db.expenses().find(ExpensesService._buildQuery(user, month, category)).toArray()
        return data.map(this._mapExpense)
    }

    async count() {
        return await this.db
            .expenses()
            .estimatedDocumentCount()
    }

    async countCategories() {
        const result = await this.db
            .expenses()
            .aggregate([{ $group: { _id: '$category' } }, { $group: { _id: null, count: { $sum: 1 } } }])
            .toArray()
        return result.length === 1 ? result[0].count : 0
    }

    async listRecurring(user) {
        if (!user) throw new Error('user missing')

        const data = await this.db
            .expenses()
            .find({
                user,
                isTemplate: true,
            })
            .toArray()
        return data.map(this._mapExpense)
    }

    async summarize(user, month, category) {
        if (!user) throw new Error('user missing')

        const query = ExpensesService._buildQuery(user, month, category)
        delete query.category

        const data = (await this.db
            .expenses()
            .aggregate([{ $match: query }, { $group: { _id: '$category', total: { $sum: '$amount' } } }])
            .toArray())
            .filter((e) => !category || e._id === category)
            .map((e) => ({
                ...e,
                _id: e._id || 'uncategorized',
                total: e.total.toFixed(2),
            }))

        data.sort((e1, e2) => e1._id.localeCompare(e2._id))
        return data
    }

    async insert(expense) {
        if (!expense.user) throw new Error('user missing')

        return await this.db.expenses().insertOne({
            user: expense.user,
            amount: expense.amount,
            description: expense.description,
            timestamp: expense.timestamp,
            category: expense.category,
            isTemplate: expense.isTemplate || undefined,
            ref: expense.ref || undefined,
        })
    }

    async insertMany(expenses) {
        if (expenses.filter((e) => !e.user).length) throw new Error('user missing')

        return await this.db.expenses().insertMany(
            expenses.map((e) => ({
                user: e.user,
                amount: e.amount,
                description: e.description,
                timestamp: e.timestamp,
                category: e.category,
                isTemplate: e.isTemplate || undefined,
                ref: e.ref || undefined,
            }))
        )
    }

    async delete(id) {
        if (!id) throw new Error('id missing')
        return await this.db.expenses().deleteOne({ _id: id })
    }

    async clear(user, month, category) {
        if (!user) throw new Error('user missing')

        return await this.db.expenses().remove(ExpensesService._buildQuery(user, month, category))
    }

    // TODO: build more specific methods instead
    async findRaw(query, options, map = true) {
        const data = await this.db
            .expenses()
            .find(query, options)
            .toArray()
        return map ? data.map(this._mapExpense) : data
    }

    async sumTotal() {
        const result = await this.db
            .expenses()
            .aggregate([
                {
                    $match: {
                        $and: [
                            { amount: { $gte: -10000 } },
                            { amount: { $lte: 10000 } },
                            {
                                $or: [{ isTemplate: { $exists: false } }, { isTemplate: false }],
                            },
                        ],
                    },
                },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ])
            .toArray()
        return result.length === 1 ? result[0].total : 0
    }

    static parseAmount(text) {
        const isExpression = !AMOUNT_PATTERN.test(text.trim())
        return round(isExpression ? tryEval(text.replace(/[a-zA-Z]/g, '')) : parseFloat(text), 2)
    }

    static _buildQuery(user, month, category) {
        const query = {
            user: user,
            $or: [{ isTemplate: { $exists: false } }, { isTemplate: false }],
        }

        if (month) {
            const y = new Date().getFullYear()
            const m = new Date().getMonth()

            const dMonth = MONTHS_LOWER.indexOf(month.toLowerCase())
            const dYear = y - (m - dMonth < 0)
            const from = new Date(dYear, dMonth, 1)
            const to = new Date(dYear, dMonth + 1, 1)

            query.timestamp = { $lt: to, $gte: from }
        }

        if (category) {
            query.category = category
        }

        return query
    }

    static _mapExpense(dbObj) {
        return new Expense(
            dbObj._id,
            dbObj.user,
            dbObj.amount.toFixed(2),
            dbObj.description,
            dbObj.timestamp,
            dbObj.category,
            dbObj.isTemplate,
            dbObj.ref
        )
    }
}

function round(value, places) {
    if (!value) return null
    const power = Math.pow(10, places)
    return Math.round(value * power) / power
}

function tryEval(command) {
    try {
        return safeEval(command)
    } catch (e) {
        return null
    }
}

module.exports = ExpensesService
