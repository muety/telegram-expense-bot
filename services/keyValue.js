class KeyValueService {
    constructor(db) {
        this.db = db
    }

    async getUserTz(user) {
        return (await this.db
            .misc()
            .findOne({ _id: `user_tz_${user}` }))?.value
    }

    async setUserTz(user, tz) {
        return await this.db
            .misc()
            .insertOne({ _id: `user_tz_${user}`, value: tz })
    }
}

module.exports = KeyValueService