// This is not actually "middleware" in the sense of what you would expect

// Implements 'Token Bucket' rate limiting algorithm
// See https://blog.logrocket.com/rate-limiting-node-js/

class RateLimiter {
    // checks whether number of requests exceeds <capacity> per <window> seconds
    constructor(window, capacity) {
        if (!window) throw new Error('windows parameter missing')
        if (!capacity) throw new Error('capacity parameter missing or null')

        this.window = window // seconds
        this.capacity = capacity
        this.lookup = {}
    }

    check(key, refTime) {
        const t = refTime || new Date()

        if (!this.lookup.hasOwnProperty(key)) {
            this.lookup[key] = { t: t, c: this.capacity }
        }

        const entry = this.lookup[key]

        if (seconds(entry.t, t) >= this.window) {
            this.lookup[key] = { t: t, c: this.capacity }
            return true
        }

        if (entry.c > 0 || this.capacity === -1) {
            entry.c--
            return true
        }

        return false
    }
}

function seconds(d1, d2) {
    return (d2.getTime() - d1.getTime()) / 1000
}

module.exports = RateLimiter