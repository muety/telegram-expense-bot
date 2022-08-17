'use strict'

const ExpensesService = require('./services/expenses'),
  UsersService = require('./services/users'),
  utils = require('./utils')

const prom = require('prom-client'),
  Gauge = prom.Gauge,
  register = prom.register,
  db = require('./db')

const userService = new UsersService(db)
const expenseService = new ExpensesService(db)

const prefix = 'telegram_expensebot_'

prom.collectDefaultMetrics({
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  prefix,
})

const gTotalExpenses = new Gauge({
  name: `${prefix}expenses_total`,
  help: 'Total number of tracked expenses',
  labelNames: [],
  async collect() {
    this.set(await expenseService.count())
  },
})

const gTotalUsers = new Gauge({
  name: `${prefix}users_total`,
  help: 'Total number of registered users',
  labelNames: [],
  async collect() {
    this.set(await userService.count())
  },
})

const gTotalActiveUsers = new Gauge({
  name: `${prefix}active_users_total`,
  help:
    'Total number of active users, measured as such, who had at least one expense in the past week',
  labelNames: [],
  async collect() {
    const result = await userService.listActive()
    this.set(result.length)
  },
})

const gTotalCategories = new Gauge({
  name: `${prefix}categories_total`,
  help: 'Total number of different registered categories',
  labelNames: [],
  async collect() {
    this.set(await expenseService.countCategories())
  },
})

const gTotalAmount = new Gauge({
  name: `${prefix}amount_total`,
  help: 'Total amount of money currently tracked with the expense bot',
  labelNames: [],
  async collect() {
    this.set(await expenseService.sumTotal())
  },
})

module.exports = register
