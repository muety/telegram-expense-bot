"use strict";

const df = require('dateformat');

class Expense {
    constructor(user, amount, description, timestamp, category) {
        this.user = user;
        this.amount = amount;
        this.description = description;
        this.category = category;
        this.timestamp = timestamp;
    }

    toString () {
        var d = new Date(this.timestamp);
        return `[${df(d, 'mmmm dS')}] ${this.amount} - ${this.description}${this.category ? ' - ' + this.category : ''}`
    }
}

module.exports = Expense;