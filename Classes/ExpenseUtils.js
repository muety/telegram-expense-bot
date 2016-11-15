"use strict";

const _ = require('lodash');

class ExpenseUtils {
    constructor() {
    }

    sumUp (expenses) {
        var sum = 0;
        _(expenses).forEach((e) => {
            sum += parseFloat(e.amount);
        });
        return sum.toFixed(2);
    }
    
    prettyPrintAll(expenses) {
        var s = '';
        _(expenses).forEach((e) => {
            s += e.toString() + '\n';
        });
        return s;
    }
}

module.exports = ExpenseUtils;
