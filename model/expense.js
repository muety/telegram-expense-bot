'use strict'


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

    toString(noTimestamp) {
        let d = new Date(this.timestamp)
        return `${!noTimestamp ? d.toLocaleDateString('en') + ' – ' : ''}${
            this.amount
        } - ${this.description} ${this.category ? ' - ' + this.category : ''} ${
            this.ref ? '(🔁)' : ''
        }`
    }
}

module.exports = Expense
