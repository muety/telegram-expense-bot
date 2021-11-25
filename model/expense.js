'use strict';

class Expense {
    constructor(user, amount, description, timestamp, category, ref) {
        this.user = user;
        this.amount = amount;
        this.description = description;
        this.category = category;
        this.timestamp = timestamp;
        this.ref = ref
    }

    toString(noTimestamp) {
        let d = new Date(this.timestamp);
        return `${!noTimestamp ? d.toLocaleDateString('en') + ' – ' : ''}${this.amount} - ${this.description}${this.category ? ' - ' + this.category : ''} ${this.ref ? '(🔁)' : ''}`
    }
}

module.exports = Expense;