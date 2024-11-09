#!/usr/bin/node

// Script to convert telegram-expense-bot CSV export to Cospend (https://apps.nextcloud.com/apps/cospend) CSV import.

// Setup:
// npm install csv-parse csv-stringify

// Usage:
// 1. Adapt INPUT_FILE and NAME variables
// 2. Run the script

const fs = require('fs'),
  path = require('path'),
  { parse } = require('csv-parse/sync'),
  { stringify } = require('csv-stringify/sync')

// User-defined variables section
const INPUT_FILE = 'expenses_123465798_all.csv'
const OUTPUT_FILE = path.basename(`${INPUT_FILE.split('.')[0]}_cospend.csv`)
const NAME = 'John Doe'
// User-defined variables section

const categories = {}
const members = [
  { name: NAME, weight: 1, active: 1, color: '#d09e6d' }
]


// Utils 

function capitalize(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

// CSV headers

const headersMembers = ['name', 'weight', 'active', 'color']
const headersMain = ['what', 'amount', 'date', 'timestamp', 'payer_name', 'payer_weight', 'payer_active', 'owers', 'repeat', 'repeatfreq', 'repeatallactive', 'repeatuntil', 'categoryid', 'paymentmode', 'paymentmodeid', 'comment', 'deleted']
const headersCategories = ['categoryname', 'categoryid', 'icon', 'color']

// Conversion

function getOrCreateCategory(category) {
  const targetName = capitalize(category.substr(1))

  if (!categories[targetName]) {
    categories[targetName] = {
      categoryname: targetName,
      categoryid: Object.keys(categories).length + 1,
      icon: '⌛️',
      color: '#ffaa00',
    }
  }

  return categories[targetName].categoryid
}

function processRow(row) {
  const categoryid = row.category ? getOrCreateCategory(row.category) : 0

  return {
    what: row.description,
    amount: parseFloat(row.amount),
    date: new Date(parseInt(row.timestamp, 10)).toISOString().split('T')[0],
    timestamp: parseInt(row.timestamp / 1000),
    payer_name: NAME,
    payer_weight: 1,
    payer_active: 1,
    owers: NAME,
    repeat: 'n',
    repeatfreq: 1,
    repeatallactive: 0,
    repeatuntil: '',
    categoryid: categoryid,
    paymentmode: 'n',
    paymentmodeid: 0,
    comment: '',
    deleted: 0
  }
}

// Read data
const inputCsvPath = path.join(__dirname, INPUT_FILE)
const inputCsvData = fs.readFileSync(inputCsvPath, 'utf8')
const records = parse(inputCsvData, { columns: true, skip_empty_lines: true })

// Write members seciosection
const csvMembers = stringify(members, { header: true, columns: headersMembers })
fs.writeFileSync(OUTPUT_FILE, csvMembers)
fs.appendFileSync(OUTPUT_FILE, '\n')

// Write records section
const csvMain = stringify(records.map(processRow), { header: true, columns: headersMain })
fs.appendFileSync(OUTPUT_FILE, csvMain)
fs.appendFileSync(OUTPUT_FILE, '\n')

// Write categories section
const csvCategories = stringify(Object.values(categories), { header: true, columns: headersCategories })
fs.appendFileSync(OUTPUT_FILE, csvCategories)

console.log('Success! You can import the project to Cospend now.')
