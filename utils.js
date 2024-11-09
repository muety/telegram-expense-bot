// TODO: refactor this whole file!

const fs = require('fs'),
    os = require('os'),
    path = require('path'),
    geoTz = require('geo-tz'),
    archiver = require('archiver')


// String Utils

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function asCsv(expenses) {
    const header = `amount,description,category,date,timestamp`
    const body = expenses
        .map((e) => [e.amount, e.description, e.subcategory, e.category, e.timestamp, e.timestamp.getTime()].join(','))
        .join('\n')
    return `${header}\n${body}`
}

// FS Utils

function writeTempFile(fileName, content) {
    const filePath = path.join(os.tmpdir(), fileName)
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, content, (err) => {
            if (err) {
                return reject(err)
            }
            return resolve(filePath)
        })
    })
}

/**
 * @param {String} sourceFile: /some/folder/to/compress
 * @param {String} outPath: /path/to/created.zip
 * @returns {Promise}
 */
function zipFile(sourceFile, outPath) {
    const archive = archiver('zip', { zlib: { level: 9 } })
    const stream = fs.createWriteStream(outPath)

    return new Promise((resolve, reject) => {
        archive
            .file(sourceFile, { name: path.basename(sourceFile) })
            .on('error', err => reject(err))
            .pipe(stream)

        stream.on('close', () => resolve(outPath))
        archive.finalize()
    })
}


function deleteFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                return reject(err)
            }
            return resolve()
        })
    })
}

// Telegram Utils

function sendSplit(bot, recipient, text, options) {
    const linesIn = text.split('\n')
    const linesOut = [[]]

    let currentBytes = 0
    for (let i = 0; i < linesIn.length; i++) {
        const len = Buffer.byteLength(linesIn[i], 'utf8')  // because of emojis, one char can be more than 1 byte
        if (currentBytes + len < 4095) {
            linesOut.at(-1).push(linesIn[i])
            currentBytes += len
        } else {
            linesOut.push([linesIn[i]])
            currentBytes = len
        }
    }

    return Promise.all(linesOut.map(msgLines => bot.sendMessage(
        recipient, msgLines.join('\n'), options
    )))
}

// Date utils
function resolveTimeZone(lat, lon) {
    return geoTz.find(lat, lon)[0]
}

// Other Utils

// wraps an async function with a catch-all error handler
const wrapAsync = fn =>
    function asyncUtilWrap(...args) {
        const fnReturn = fn(...args)
        return Promise.resolve(fnReturn).catch(console.error)
    }

module.exports = {
    capitalize,
    asCsv,
    writeTempFile,
    zipFile,
    deleteFile,
    sendSplit,
    resolveTimeZone,
    wrapAsync,
}
