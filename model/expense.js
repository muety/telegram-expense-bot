'use strict';

const df = require('dateformat');

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
        return `${!noTimestamp ? df(d, 'mmmm dS') + ' ' : ''}${this.amount} - ${this.description}${this.category ? ' - ' + this.category : ''} ${this.ref ? '(🔁)' : ''}`
    }
}

module.exports = Expense;