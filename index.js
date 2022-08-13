'use strict'

const TelegramBot = require('node-telegram-bot-api'),
    handlers = require('./handlers'),
    db = require('./db'),
    cfg = require('./config')

async function run() {
    await db.connect()

    const bot = new TelegramBot(cfg.BOT_TOKEN, {
        polling: true,
    })

    handlers.registerAll(bot)
}

process.on('SIGINT', async () => {
    await db.disconnect()
    process.exit()
})

run()
