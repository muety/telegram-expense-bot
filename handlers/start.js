const package = require('./../package.json'),
    wrapAsync = require('../utils').wrapAsync

const text = `
Welcome to the ExpenseBot. This bot helps you manage and track your daily expenses. You can add new expenses or get an overview or list for any month, category or day.

*Initial setup*
You'll have to configure your preferred time zone initially. To do so, please send your current location as a message.

*Adding a new expense*
The following examples will show you various ways to add a new expense.
1. \`1.99 Lunch #food\` or
2. \`/new 1.99 Lunch #food\` will add an expense of _1.99_ (whichever your currency is, that doesn't matter) with the description _Lunch_ to the category _#food_.

You can simply leave out the category (which is always defined by a hash sign) - this is just for you to have a clearer overview and separation later.

*Please note:* You can also type _negative_ number if you had an income or want to compensate an expense.


*Getting your expenses*
To get an overview of your current financial situation you can do the following:
1. \`/get\` lets you choose a month.
2. \`/get April\` or simply \`April\` - the total amount of the expenses in April. Of course this works with any other month.
3. \`/get #food\` or simply \`#food\` - the total amount of expenses in the _#food_ category in the current month.
4. \`/get #food April\` or simply \`#food April\` - the total amount of expenses in the _#food_ category in April
5. The same works for weekdays instead of months, e.g. \`Monday\`
6. \`/get 2024-02-25\` - the total amount of the expenses on Feb 25th 2024.

*Listing your expenses*
To get an overview of your current financial situation you can do the following:
1. \`/list April\` - all expenses in April. Of course this works with any other month.
2. \`/list #food April\` - all expenses in the _#food_ category in April
3. \`/list 2024-02-25\` - all expenses on Feb 25th 2024.

*Exporting your expenses*
You can export your expenses to a CSV file to archive them or do further analyses in Excel or so. To create new export do:
1. \`/export April\` - export all expeses from April.

*Resetting your expenses*
To reset (i.e. delete) all your expenses for a given month or category, you can do the following:
1. \`/reset April\` - delete all expenses in April. Of course this works with any other month.
2. \`/reset #food\` - delete all expenses in the _#food_ category in the current month.
2. \`/reset 2024-02-25\` - delete all expenses from Feb 25th 2024.

Code, bug reports, feature requests and further information on [GitHub](https://github.com/muety/telegram-expense-bot).

Version: \`${package.version}\`
`

function onHelp(bot) {
    return async function (msg) {
        await bot.sendMessage(msg.chat.id, text, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
        })
    }
}

function register(bot, middleware) {
    console.log('✅ Registering handlers for /start ...')
    bot.onText(/^\/help$/, middleware(wrapAsync(onHelp(bot))))
    bot.onText(/^\/start$/, middleware(wrapAsync(onHelp(bot))))
}

module.exports = {
    register,
}
