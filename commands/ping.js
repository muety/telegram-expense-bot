const _ = require('lodash')
    , cfg = require('./../config')
    , db  = require('./../db')
    , utils = require('./../utils')
    , ExpenseUtils = new require('./../Classes/ExpenseUtils');

var eu = new ExpenseUtils();

module.exports = function (bot) {
    return function (message, args) {
        bot.sendMessage(new bot.classes.Message(message.chat.id, 'Yep, I\'m still alive!'));
    }
};
