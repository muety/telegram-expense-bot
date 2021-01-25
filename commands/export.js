const cfg = require('./../config')
    , utils = require('./../utils')
    , LIMITS = require('./../config.json').RATE_LIMITS || {}
    , RateLimiter = require('./../middleware/rate_limit')

module.exports = function (bot) {
    const limiter = new RateLimiter(24 * 60 * 60, LIMITS['export'] || -1)

    return function (message, args) {
        if (!limiter.check(message.chat.id, new Date(message.date * 1000))) {
            return
        }

        if (!args[0]) return bot.sendMessage(new bot.classes.Message(message.chat.id, {
            text: `Please specify a month to download the expenses for.\nE.g. you can type \`${cfg.COMMANDS.EXPORT} April\` to get expenses for April`,
            parse_mode: 'Markdown'
        }))

        const callback = function (err, all) {
            if (err) return

            const csvData = utils.asCsv(all)
            
            utils.writeTempFile(`expenses_${message.chat.id}_${utils.capitalize(args[0])}.csv`, csvData)
                .then(file => {
                    bot.sendFile(new bot.classes.Message(message.chat.id, {
                        document: file,
                        caption: `CSV export of your expenses for ${utils.capitalize(args[0])}`,
                        reply_markup: new bot.classes.ReplyKeyboardHide
                    }))
                    return file
                })
                .then(utils.deleteFile)
                .catch(console.error)
        }

        utils.findExpenses(message, args, callback)
    }
}
