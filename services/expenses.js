const MONTHS_LOWER = require('../constants').MONTHS_LOWER

class ExpensesService {
    constructor(db) {
        this.db = db
    }

    async getMany(user, month, category) {
        if (!user) return

        const cursor = await this.db
            .expenses()
            .find(this._buildQuery(user, month, category))

        const data = await cursor.toArray()

        return data.map(this._mapExpense)
    }

    async summarizeMany(user, month, category) {
        if (!user) return

        const query = this._buildQuery(user, month, category)
        delete query.category

        const cursor = await this.db
            .expenses()
            .aggregate([
                { $match: query },
                { $group: { _id: '$category', total: { $sum: '$amount' } } },
            ])

        const data = (await cursor.toArray())
            .filter((e) => !category || e._id === category)
            .map((e) => ({
                ...e,
                _id: e._id || 'uncategorized',
                total: e.total.toFixed(2),
            }))
        data.sort((e1, e2) => e1._id.localeCompare(e2._id))
        return data
    }

    _buildQuery(user, month, category) {
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

    _mapExpense(dbObj) {
        return new Expense(
            dbObj.user,
            dbObj.amount.toFixed(2),
            dbObj.description,
            dbObj.timestamp,
            dbObj.subcategory,
            dbObj.category,
            dbObj.ref
        )
    }
}

module.exports = ExpensesService
