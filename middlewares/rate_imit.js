const RateLimiter = require('../vendor/rate_limiting')

function setup(bot, window, capacity) {
    const limiter = new RateLimiter(window, capacity)  // no more than X req / hr in total per user

    function middleware(msg) {
        if (!limiter.check(msg.chat.id, new Date(msg.date * 1000))) {
            console.log(`⚠️ User ${msg.chat.id} exceeded rate limit (message: "${msg.text}")`)
            this.stop()
        }
    }

    return middleware
}

module.exports = setup