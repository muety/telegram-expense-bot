function setup(bot, message) {
    function* middleware(msg) {
        if (message) {
            yield bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown', disable_web_page_preview: true })
            this.stop()
        }
    }

    return middleware
}

module.exports = setup