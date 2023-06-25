'use strict'

const moment = require('moment-timezone')

class Expense {
    constructor(
        id,
        user,
        amount,
        description,
        timestamp,
        category,
        isTemplate,
        ref,
    ) {
        this.id = id
        this.user = user
        this.amount = amount
        this.description = description
        this.category = category
        this.timestamp = timestamp
        this.isTemplate = isTemplate
        this.ref = ref
    }

    toString(noTimestamp, tz) {
        let d = moment.tz(this.timestamp, tz)
        return `${!noTimestamp ? d.format('YYYY/M/D') + ' – ' : ''}${
            this.amount
        } - ${this.description} ${this.category ? ' - ' + this.category : ''} ${
            this.ref ? '(🔁)' : ''
        }`
        .replaceAll('_', '\\_')
        .replaceAll('*', '\\*')
        .replaceAll('[', '\\[')
        .replaceAll('`', '\\`')
    }
}

module.exports = Expense
