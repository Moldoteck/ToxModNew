# Telegram bot starter based on [grammY](https://grammy.dev)

Please, enjoy this starter template for Telegram bots based on [grammY](https://grammy.dev). It includes most common middlewares, MongoDB integration, language picker and internationalization and shows basic encapsulation techniques used by me.

# Installation and local launch

1. Clone this repo: `git clone https://github.com/Borodutch/telegram-bot-starter`
2. Launch the [mongo database](https://www.mongodb.com/) locally
3. Create `.env` with the environment variables listed below
4. Run `yarn` in the root folder
5. Run `yarn develop`

And you should be good to go! Feel free to fork and submit pull requests. Thanks!

# Environment variables

- `TOKEN` — Telegram bot token
- `MONGO` — URL of the mongo database

Also, please, consider looking at `.env.sample`.

# License

MIT — use for any purpose. Would be great if you could leave a note about the original developers. Thanks!

# Telegram bot for moderating toxic messages in group chats

<a href="https://t.me/ToxModBot">@ToxModBot</a><br>
_Tired of moderating endless messages in group chats? Try ToxMod._
This bot can warn users if their message can be toxic to someone and it can help moderating group messages, by sending to moderators a message with link to possible toxic messages.
`doNotStore` flag is set to true in order to preserve better privacy for message content (it will not be stored on servers)

# API's:

Google Perspective API

# Installation and local launch

1. Clone this repo: `git clone https://github.com/Moldoteck/ToxMod`
2. Launch the [mongo database](https://www.mongodb.com/) locally
3. Create `.env` with the environment variables listed below
4. Run `yarn install` in the root folder
5. Run `yarn develop`

And you should be good to go! Feel free to fork and submit pull requests. Thanks!

# Environment variables

- `TOKEN` — Telegram bot token
- `MONGO`— URL of the mongo database
- `PERSPECTIVEKEY` — Token for Google Perspective API. More info here: https://perspectiveapi.com

Also, please, consider looking at `.env.sample`.

# License

MIT — use for any purpose. Would be great if you could leave a note about the original developers. Thanks!

Inspired from here: https://github.com/backmeupplz/telegraf-template
