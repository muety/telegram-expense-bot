const Expense = require('./Classes/Expense')
    , cfg = require('./config')
    , _ = require('lodash');

function parseExpenseMessage(messageText) {
    if (/-*\d+\.\d+[a-zA-z\ ]+/.test(messageText)) {
        return [
            parseFloat(messageText.match(/-*\d+\.\d+/)),
            _.trim(messageText.match(/-*\d+\.\d+[a-zA-z\ ]+/)[0].match(/[a-zA-z\ ]+/)[0]),
            /#\w+/.test(messageText) ? messageText.match(/#\w+/)[0] : null
        ];
    }
    return false;
}

function generateQueryFromUserMessage(args, user) {
    if (!user) return false;

    var date = new Date(), cat, from, to;

    if (/^#\w+$/.test(args[0]) && !args[1]) {
        // /get #food
        from = new Date(date.getFullYear(), date.getMonth(), 1),
            to = new Date(date.getFullYear(), date.getMonth() + 1, 1),
            cat = args[0];
    }
    else if (/^[A-Za-z]+$/.test(args[0]) && !args[1]) {
        // /get january
        var capitalized = capitalizeFirstLetter(args[0]);

        if (cfg.MONTHS.hasOwnProperty(capitalized)) {
            from = new Date(date.getFullYear(), cfg.MONTHS[capitalized], 1),
                to = new Date(date.getFullYear(), cfg.MONTHS[capitalized] + 1, 1);
        }
        else if (cfg.WEEKDAYS.hasOwnProperty(capitalized)) {
            from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() - cfg.WEEKDAYS[capitalized])),
                to = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() - cfg.WEEKDAYS[capitalized]) + 1);
        }
    }
    else if (/^[A-Za-z]+$/.test(args[0]) && /^#\w+$/.test(args[1])) {
        // /get january #food
        var capitalized = capitalizeFirstLetter(args[0]);

        if (cfg.MONTHS.hasOwnProperty(capitalized)) {
            from = new Date(date.getFullYear(), cfg.MONTHS[capitalized], 1),
                to = new Date(date.getFullYear(), cfg.MONTHS[capitalized] + 1, 1)
        }
        else if (cfg.WEEKDAYS.hasOwnProperty(capitalized)) {
            from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() - cfg.WEEKDAYS[capitalized])),
                to = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() - cfg.WEEKDAYS[capitalized]) + 1);
        }
        cat = args[1];
    }
    else if (/^[A-Za-z]+$/.test(args[1]) && /^#\w+$/.test(args[0])) {
        // /get #food january
        var capitalized = capitalizeFirstLetter(args[1]);

        if (cfg.MONTHS.hasOwnProperty(capitalized)) {
            from = new Date(date.getFullYear(), cfg.MONTHS[capitalized], 1),
                to = new Date(date.getFullYear(), cfg.MONTHS[capitalized] + 1, 1)
        }
        else if (cfg.WEEKDAYS.hasOwnProperty(capitalized)) {
            from = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() - cfg.WEEKDAYS[capitalized])),
                to = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() - cfg.WEEKDAYS[capitalized]) + 1);
        }
        cat = args[0];
    }

    return cat ? {timestamp: {$lt: to, $gte: from}, category: cat, user: user} : {timestamp: {$lt: to, $gte: from}, user: user};
}

function queryExpensesByUserMessage (expensesCollection, message, args, callback) {
    var query = generateQueryFromUserMessage(args, message.chat.id);
    if (!query) return callback(true, null);
    expensesCollection.find(query).toArray((err, all) => {
        if (err) return callback(err);
        var expenses = [];
        _(all).forEach((item) => {
            expenses.push(new Expense(item.user, item.amount.toFixed(2), item.description, item.timestamp, (item.category ? item.category : undefined)));
        });
        callback(null, expenses);
    });
}

function deleteExpensesByUserMessage (expensesCollection, message, args, callback) {
    var query = generateQueryFromUserMessage(args, message.chat.id);
    if (!query) return callback(true, null);
    expensesCollection.remove(query, callback);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    parseExpenseMessage: parseExpenseMessage,
    queryExpensesByUserMessage: queryExpensesByUserMessage,
    deleteExpensesByUserMessage: deleteExpensesByUserMessage,
    generateQueryFromUserMessage: generateQueryFromUserMessage,
    capitalizeFirstLetter: capitalizeFirstLetter
};
