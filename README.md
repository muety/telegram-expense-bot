# telegram-expense-bot
This is a bot for the [Telegram](https://telegram.org/) messaging app using their [bot platform](https://core.telegram.org/bots). The code is open-source and consequently anybody could set up an own instance of the bot. To learn how to do so, see [this section](#how-to-host-it-myself). The official hosted version is available as [@ExpenseBot](https://telegram.me/ExpenseBot). To learn more about this bot, please refer to [this blog article](https://ferdinand-muetsch.de/telegram-expensebot-doodlerbot.html) or just send the bot a message with the `/help` command.

![](https://anchr.io/i/rbtPU.png)

## What does it do?
This bot’s purpose is to help people manage their daily expenses and keep track of their financial situation. Users can add expenses from wherever they are using a few simple commands from within the chat and have an eye on how much they have spent in a month or a day. This obviates the need for confusing Excel spreadsheets or paper notes. 

## How to host it myself?
### Prerequisites
In order to host this bot on your own, you need a few things.
* Server to run the bot on (since the bot uses the long polling method to [get updates](https://core.telegram.org/bots/api/#getupdates) instead of the web-hook one, you don't need HTTPS certificates or ports to be exposed)
* Node.js (preferbly at the latest version)
* A MongoDB database (you can use [mlab.com](http://mlab.com) to get a free, hosted MongoDB)
* A bot token, which you get from registering a new bot to the [@BotFather](https://telegram.me/BotFather)

### Configuration
To configure your bot, clone this repository, copy `config.example.json` to `config.json` and edit it.
* `DB_URL`: your MongoDB's complete URL including hostname, port, username, password and database name (if using _mlab_, you can simply copy this from their website)
* `DB_COLLECTION`: the name of the database collection where your data should be stored, e.g. _"expenses_live"_
* `BOT_TOKEN`: the token you got from the _BotFather_
* `BOT_NAME`: the bot's name, e.g. _"ExpenseBot"_ in my case
* `BOT_TELEGRAM_USERNAME`: the bot's actual unique Telegram username, e.g. _"@ExpenseBot"_ in my case (note that this can differ from the `BOT_NAME`, which is not unique)

### Run
```bash
$ npm start
```

## License
MIT @ [Ferdinand Mütsch](https://muetsch.io)