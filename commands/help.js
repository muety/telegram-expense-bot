const cfg = require('./../config')

const text = `
        Welcome to the ExpenseBot. This bot helps you manage and track your daily expenses. You can add new expenses or get an overview or list for any month or category.
        
        
        *Adding a new expense*
        The following examples will show you various ways to add a new expense.
        1. \`1.99 Lunch #food\` or
        2. \`${cfg.COMMANDS.NEW} 1.99 Lunch #food\` will add an expense of _1.99_ (whichever your currency is, that doesn't matter) with the description _Lunch_ to the category _#food_.
        
        You can simply leave out the category (which is always defined by a hash sign) - this is just for you to have a clearer overview and separation later.
        
        *Please note:* You always need to type the decimal separator dot (e.g. _1.0_ instead of simply _1_). Further you can also type _negative_ number if you had an income or want to compensate an expense.
        
        
        *Getting your expenses*
        To get an overview of your current financial situation you can do the following:
        1. \`${cfg.COMMANDS.GET}\` lets you choose a month.
        2. \`${cfg.COMMANDS.GET} April\` or simply \`April\` - the total amount of the expenses in April. Of course this works with any other month.
        3. \`${cfg.COMMANDS.GET} #food\` or simply \`#food\` - the total amount of expenses in the _#food_ category in the current month.
        4. \`${cfg.COMMANDS.GET} #food April\` or simply \`#food April\` - the total amount of expenses in the _#food_ category in April
        5. The same works for weekdays instead of months, e.g. \`Monday\`
        
        *Listing your expenses*
        To get an overview of your current financial situation you can do the following:
        1. \`${cfg.COMMANDS.LIST} April\` - all expenses in April. Of course this works with any other month.
        2. \`${cfg.COMMANDS.LIST} #food\` - all expenses in the _#food_ category in the current month.
        3. \`${cfg.COMMANDS.LIST} #food April\` - all expenses in the _#food_ category in April
        4. The same works for weekdays instead of months, e.g. \`Monday\`

        *Exporting your expenses*
        You can export your expenses to a CSV file to archive them or do further analyses in Excel or so. To create new export do:
        1. \`${cfg.COMMANDS.EXPORT} April\` - export all expeses from April.
        
        *Resetting your expenses*
        To reset (i.e. delete) all your expenses for a given month or category, you can do the following:
        1. \`${cfg.COMMANDS.RESET} April\` - delete all expenses in April. Of course this works with any other month.
        2. \`${cfg.COMMANDS.RESET} #food\` - delete all expenses in the _#food_ category in the current month.
        3. \`${cfg.COMMANDS.RESET} #food April\` - delete all expenses in the _#food_ category in April
        4. The same works for weekdays instead of months, e.g. \`Monday\`

        Code, bug reports, feature requests and further information on [GitHub](https://github.com/muety/telegram-expense-bot).
    `

module.exports = function (bot) {
    return function (message, args) {
        bot.sendMessage(new bot.classes.Message(message.chat.id, {
            text,
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        }))
    }
}
