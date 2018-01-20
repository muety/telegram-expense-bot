const db = require('./db'),
    _ = require('lodash'),
    cfg = require('./config'),
    fs = require('fs'),
    path = require('path'),
    botlib = require('telegram-bot-sdk'),
    Expense = require('./Classes/Expense'),
    utils = require('./utils');

const recoveryFile = cfg.RECOVER_FILE.indexOf('/') === 0 ? cfg.RECOVER_FILE : path.normalize(__dirname + '/' + cfg.RECOVER_FILE);
var recover = null,
    initialOffset = null,
    expenses = null;

try {
    recover = require(recoveryFile);
    initialOffset = recover.offset + 1;
} catch (e) {
    initialOffset = 0;
}

const bot = botlib(cfg.BOT_TOKEN, null, processNonCommand, processInlineQuery, initialOffset);
const commands = {
    new: require('./commands/new')(bot),
    get: require('./commands/get')(bot),
    list: require('./commands/list')(bot),
    reset: require('./commands/reset')(bot),
    ping: require('./commands/ping')(bot),
    help: require('./commands/help')(bot)
};
bot.setCommandCallbacks(commands);

db.init(() => {
    if (cfg.WEBHOOK_MODE) bot.listen(cfg.PORT, cfg.BOT_TOKEN);
    else bot.getUpdates();
    expenses = db.getCollection();
});

function processNonCommand(message) {
    if (!message || !message.text) return false;
    // A message consisting of a month name
    if (/^([A-Za-z]+|#\w+|[A-Za-z]+\ #\w+|#\w+\ [A-Za-z]+)$/.test(message.text)) {
        var monthOrDay = message.text.match(/[A-Za-z]+/);
        var capitalized = utils.capitalizeFirstLetter(monthOrDay[0]);

        if (!monthOrDay || cfg.MONTHS.hasOwnProperty(capitalized)) {
            return commands.get(message, _.split(message.text, ' '));
        } else if (!monthOrDay || cfg.WEEKDAYS.hasOwnProperty(capitalized)) {
            return commands.get(message, _.split(message.text, ' '));
        }
    }

    // A message consisting anything else - probably an expense to add
    var parsed = utils.parseExpenseMessage(message.text);
    if (!parsed[0] || _.isNumber(!parsed[0]) || !parsed[1]) return bot.sendMessage(new bot.classes.Message(message.chat.id, 'Sorry, it looks like I didn\'t understand you. Maybe you forgot the decimal point in a number? Please try again.'), () => {});
    commands.new(message, [parsed[0], parsed[1], parsed[2] ? parsed[2] : null]);
}

function processInlineQuery(query) {}

/* In the unwanted case the bot crashes due to a malformed message that causes an exception the bot can't handle, we at least need to save the current offset
 (is incremented by one in initialization) so that the bot won't get stuck in a loop fetching this message on restart and crashing again. */
process.on('SIGINT', () => {
    fs.writeFileSync(recoveryFile, JSON.stringify({
        offset: bot.getOffset()
    }));
    db.close();
    process.exit();
});