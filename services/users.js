class UsersService {
    constructor(db) {
        this.db = db
    }

    async listActive(thresholdDays = 7) {
        const startDate = new Date(new Date().setDate(new Date().getDate() - thresholdDays))
        const result = await this.db
            .expenses()
            .aggregate([
                { $match: { timestamp: { $gt: startDate } } },
                { $group: { _id: '$user', count: { $sum: 1 } } },
            ])
        return await result.toArray()
    }
}

module.exports = UsersService
