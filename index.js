'use strict'

const db = require('./db'),
    cfg = require('./config'),
    fs = require('fs'),
    path = require('path'),
    botlib = require('telegram-bot-sdk'),
    utils = require('./utils'),
    metrics = require('./metrics'),
    jobs = require('./jobs'),
    assert = require('assert')

const recoveryFile = cfg.RECOVER_FILE.indexOf('/') === 0
    ? cfg.RECOVER_FILE
    : path.normalize(__dirname + '/' + cfg.RECOVER_FILE)

const requiredCommands = ['new', 'list', 'get', 'repeat', 'stop', 'export', 'help', 'reset']
requiredCommands.forEach(k => {
    assert(
        cfg.COMMANDS.hasOwnProperty(k) ||
        cfg.COMMANDS.hasOwnProperty(k.toUpperCase())
    )
})

let recover = null,
    initialOffset = null,
    expenses = null

try {
    recover = require(recoveryFile)
    initialOffset = recover.offset + 1
} catch (e) {
    initialOffset = 0
}

const bot = botlib(
    cfg.BOT_TOKEN,
    null,
    processNonCommand,
    processInlineQuery,
    initialOffset
)

const commands = Object.keys(cfg.COMMANDS)
    .map(k => k.toLowerCase())
    .reduce((obj, k) => Object.assign(obj, { [k]: require(`./commands/${k}`)(bot) }), {})

bot.setCommandCallbacks(commands)

db.init(() => {
    jobs.runDefault(bot)
    jobs.scheduleDefault(bot)

    if (cfg.WEBHOOK_MODE) {
        bot.registerCustomRoute('get', '/metrics', async (req, res) => {
            res.set('Content-Type', metrics.contentType)
            res.end(await metrics.metrics())
        })

        bot.registerCustomRoute('get', '/health', (req, res) => {
            const dbState = db.isConnected() ? 1 : 0
            res.set('Content-Type', 'text/plain')
            res.end(`app=1\ndb=${dbState}`)
        })

        bot.listen(cfg.PORT, cfg.BIND_IP4, cfg.BOT_TOKEN)
    }
    else bot.getUpdates()
    expenses = db.getCollection()
})

function processNonCommand(message) {
    if (!message || !message.text) return false
    // A message consisting of a month name
    if (/^([A-Za-z]+|#\w+|[A-Za-z]+\ #\w+|#\w+\ [A-Za-z]+)$/.test(message.text)) {
        let monthOrDay = message.text.match(/[A-Za-z]+/)
        let capitalized = utils.capitalize(monthOrDay[0])

        if (!monthOrDay || cfg.MONTHS.hasOwnProperty(capitalized)) {
            return commands.get(message, message.text.split(' '))
        } else if (!monthOrDay || cfg.WEEKDAYS.hasOwnProperty(capitalized)) {
            return commands.get(message, message.text.split(' '))
        }
    }

    // A message consisting anything else - probably an expense to add
    const [ amount, description, category ] = utils.parseExpenseInput(message.text) || []
    if (!amount) return bot.sendMessage(new bot.classes.Message(message.chat.id, {
        text: 'Sorry, it looks like I didn\'t understand you. Maybe you forgot the decimal point in a number? Please try again.'
    }))
    commands.new(message, [amount, description, category])
}

function processInlineQuery(query) {
}

/* In the unwanted case the bot crashes due to a malformed message that causes an exception the bot can't handle, we at least need to save the current offset
 (is incremented by one in initialization) so that the bot won't get stuck in a loop fetching this message on restart and crashing again. */
process.on('SIGINT', () => {
    fs.writeFileSync(recoveryFile, JSON.stringify({
        offset: bot.getOffset()
    }))
    db.close()
    process.exit()
})