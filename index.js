'use strict'

const TelegramBot = require('node-telegram-bot-api'),
    express = require('express'),
    asyncHandler = require('express-async-handler'),
    randomUUID = require('crypto').randomUUID,
    handlers = require('./handlers'),
    jobs = require('./jobs'),
    db = require('./db'),
    cfg = require('./config'),
    metrics = require('./metrics'),
    rateLimit = require('./middlewares/rate_imit')

async function trySelfRegister(bot, secret) {
    if (cfg.PUBLIC_URL) {
        console.log('⏳ Registering bot with Telegram API (setWebhook) ...')
        bot.setWebHook(`${cfg.PUBLIC_URL}/updates`, {
            secret_token: secret,
        })
        console.log(`✅ Successfully registered webhook '${cfg.PUBLIC_URL}/updates' (secret token: ${secret})`)
    } else {
        console.log(`⚠️ Auto-registration skipped, as no PUBLIC_URL was passed. You need to register the webhook yourself (secret token: ${secret}) (see https://core.telegram.org/bots/api#setwebhook)`)
    }
}

async function run() {
    // Initialization + checks
    if (!cfg.BOT_TOKEN) throw Error('❌ You need to pass a bot token')
    const secretToken = randomUUID()

    const dbRoot = await db.connect()

    // Bot setup
    const bot = new TelegramBot(cfg.BOT_TOKEN, {
        polling: !cfg.WEBHOOK_MODE,
    })

    // Handler registration
    handlers.registerAll(bot, rateLimit(
        60 * 60, cfg.RATE_LIMIT || -1
    ))

    // Web server setup + route registration
    if (cfg.WEBHOOK_MODE) {
        const app = express()
        app.use(express.json())

        console.log('✅ Registering /updates route ...')
        app.post('/updates', asyncHandler(async (req, res) => {
            if (req.get('X-Telegram-Bot-Api-Secret-Token') !== secretToken) {
                return res.sendStatus(401)
            }

            bot.processUpdate(req.body)
            res.sendStatus(200)
        }))

        console.log('✅ Registering /metrics route ...')
        app.get('/metrics', asyncHandler(async (req, res) => {
            res.set('Content-Type', metrics.contentType)
            res.end(await metrics.metrics())
        }))

        console.log('✅ Registering /health route ...')
        app.get('/health', asyncHandler(async (req, res) => {
            let dbState = 0
            try {
                await await dbRoot.command({ ping: 1 })
                dbState = 1
            } catch (e) { }
            res.set('Content-Type', 'text/plain')
            res.end(`app=1\ndb=${dbState}`)
        }))

        app.listen(cfg.PORT, cfg.BIND_IP4, () => {
            console.log(`✅ Listening at ${cfg.BIND_IP4}:${cfg.PORT} ...`)
        })

        setTimeout(async () => trySelfRegister(bot, secretToken), 100)
    }

    // Job scheduling
    jobs.runDefault(bot)
    jobs.scheduleDefault(bot)
}

process.on('SIGINT', async () => {
    await db.disconnect()
    process.exit()
})

run()
