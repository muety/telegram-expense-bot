class UsersService {
    constructor(db) {
        this.db = db
    }

    async listActive(thresholdDays = 7) {
        const startDate = new Date(new Date().setDate(new Date().getDate() - thresholdDays))
        return await this.db
            .expenses()
            .aggregate([
                { $match: { timestamp: { $gt: startDate } } },
                { $group: { _id: '$user', count: { $sum: 1 } } },
            ])
            .toArray()
    }

    async count() {
        const result = await this.db
            .expenses()
            .aggregate([{ $group: { _id: '$category' } }, { $group: { _id: null, count: { $sum: 1 } } }])
            .toArray()
        return result.length === 1 ? result[0].count : 0
    }
}

module.exports = UsersService
