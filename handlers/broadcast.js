const db = require('../db'),
    cfg = require('../config.json'),
    UsersService = require('../services/users')

const PATTERN_DEFAULT = /^\/broadcast (\/yes )?(.+)$/i

const userService = new UsersService(db)

function onBroadcast(bot) {
    return async function (msg, match) {
        if (!cfg.ADMINS.includes(msg.from.id)) return

        const dry = !match[1]
        
        let userIds, recipients

        try {
            userIds = (await userService.listActive()).map((u) => u._id)
            recipients = dry ? userIds.filter((uid) => uid === msg.from.id) : userIds

            await Promise.all(
                recipients.map((uid) =>
                    bot.sendMessage(uid, match[2], {
                        parse_mode: 'Markdown',
                        disable_web_page_preview: true,
                    })
                )
            )

            await bot.sendMessage(
                msg.chat.id,
                `✅ Sent to *${userIds.length}* users ${dry ? '(dry mode, use with `/yes`)' : ''}`,
                { parse_mode: 'Markdown' }
            )
        } catch (e) {
            console.error(`Failed to broadcast to ${userIds.length} recipients: ${e}`)
            await bot.sendMessage(msg.chat.id, `Error: \`${e}\``, { parse_mode: 'Markdown' })
        }
    }
}

function register(bot) {
    console.log('✅ Registering handlers for /broadcast ...')
    bot.onText(PATTERN_DEFAULT, onBroadcast(bot))
}

module.exports = {
    register,
}
