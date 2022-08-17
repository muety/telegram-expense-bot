# telegram-expense-bot
This is a bot for the [Telegram](https://telegram.org/) messaging app using their [bot platform](https://core.telegram.org/bots). The code is open-source and consequently anybody could set up an own instance of the bot. To learn how to do so, see [this section](#how-to-host-it-myself). The official hosted version is available as [@ExpenseBot](https://telegram.me/ExpenseBot). To learn more about this bot, please refer to [this blog article](https://ferdinand-muetsch.de/telegram-expensebot-doodlerbot.html) or just send the bot a message with the `/help` command.

![](https://anchr.io/i/rbtPU.png)

## What does it do?
This bot’s purpose is to help people manage their daily expenses and keep track of their financial situation. Users can add expenses from wherever they are using a few simple commands from within the chat and have an eye on how much they have spent in a month or a day. This obviates the need for confusing Excel spreadsheets or paper notes. 

## How to host it myself?
### Prerequisites
In order to host this bot on your own, you need a few things.
* Server to run the bot on (since the bot uses the long polling method to [get updates](https://core.telegram.org/bots/api/#getupdates) instead of the web-hook one, you don't need HTTPS certificates or ports to be exposed)
* Node.js >= 14.17.x
* A MongoDB database (you can use [mlab.com](http://mlab.com) to get a free, hosted MongoDB)
* A bot token, which you get from registering a new bot to the [@BotFather](https://telegram.me/BotFather)

### Configuration
To configure your bot, clone this repository, copy `config.example.json` to `config.json` and edit it.

| **Property**            | **Default**   | **Required** | **Description**                                                                                                                       |
|-------------------------|---------------|--------------|---------------------------------------------------------------------------------------------------------------------------------------|
| `BOT_TOKEN`             | `-`           | Yes          | Your bot's token (received from BotFather).                                                                                           |
| `PUBLIC_URL`            | `-`           | Webhook only | URL at which your bot is publicly available (for Telegram to send updates). Required in webhook mode. Ex.: `https://bot.example.org`. |
| `DB_URL`                | `-`           | Yes          | MongoDB database connection string (starting with `mongodb://`)                                                                       |
| `DB_COLLECTION`         | `expenses`    | Yes          | MongoDB collection for storing expenses                                                                                               |
| `BIND_IPV4`             | `127.0.0.1`   | Webhook only | Address where to listen for HTTP requests                                                                                             |
| `PORT`                  | `3010`        | Webhook only | Port where to listen for HTTP requests                                                                                                |
| `BOT_NAME`              | `ExpenseBot`  | Yes          | The bot's name                                                                                                                        |
| `BOT_TELEGRAM_USERNAME` | `@ExpenseBot` | Yes          | The bot's actual unique Telegram username                                                                                             |
| `ADMIN`                 | `[]`          | Yes          | List of Telegram user IDs to grant admin access                                                                                       |


### Install
```bash
$ yarn
```

### Run
```bash
$ yarn start:production
```

## Metrics
When using webhook mode, [Prometheus](https://prometheus.io) metrics are exposed at `/metrics`.

## Database
```javascript
db.expenses.createIndex({ "user": 1 }, { name: "idx_user" });
db.expenses.createIndex({ "user": 1, "isTemplate": 1, "timestamp": 1, "category": 1 }, { name: "idx_full_query" });
db.expenses.createIndex({ "isTemplate": 1, "user": 1 }, { name: "idx_template_user" });
db.expenses.createIndex({ "isTemplate": 1, "user": 1, "timestamp": 1 }, { name: "idx_template_user_time" });
db.expenses.createIndex({ "ref": 1 }, { name: "idx_ref" });
```

## License
MIT @ [Ferdinand Mütsch](https://muetsch.io)
