// TODO: refactor this whole file!

const fs = require('fs'),
    os = require('os'),
    path = require('path')

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

module.exports = {
    capitalize,
    asCsv,
    writeTempFile,
    deleteFile,
}
