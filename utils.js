// TODO: refactor this whole file!

const Expense = require('./model/expense'),
    cfg = require('./config'),
    fs = require('fs'),
    os = require('os'),
    path = require('path'),
    db = require('./db')

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

async function countExpenses() {
    return await db.getCollection().estimatedDocumentCount()
}

async function countUsers() {
    const result = await db
        .getCollection()
        .aggregate([{ $group: { _id: '$user' } }, { $group: { _id: null, count: { $sum: 1 } } }])
        .toArray()

    return result.length === 1 ? result[0].count : 0
}

async function countCategories() {
    const result = await db
        .getCollection()
        .aggregate([{ $group: { _id: '$category' } }, { $group: { _id: null, count: { $sum: 1 } } }])
        .toArray()

    return result.length === 1 ? result[0].count : 0
}

async function getActiveUsers() {
    const startDate = new Date(new Date().setDate(new Date().getDate() - 7))

    const result = await db
        .getCollection()
        .aggregate([{ $match: { timestamp: { $gt: startDate } } }, { $group: { _id: '$user', count: { $sum: 1 } } }])
        .toArray()

    return result.map((e) => e._id)
}

async function sumTotal() {
    const result = await db
        .getCollection()
        .aggregate([
            {
                $match: {
                    $and: [
                        { amount: { $gte: -10000 } },
                        { amount: { $lte: 10000 } },
                        {
                            $or: [{ isTemplate: { $exists: false } }, { isTemplate: false }],
                        },
                    ],
                },
            },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .toArray()

    return result.length === 1 ? result[0].total : 0
}

module.exports = {
    capitalize,
    asCsv,
    writeTempFile,
    deleteFile,
    countExpenses,
    countUsers,
    countCategories,
    getActiveUsers,
    sumTotal,
}
