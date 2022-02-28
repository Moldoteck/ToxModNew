const needle = require('needle')
import { Bot } from 'grammy'

import Context from '@/models/Context'
import { findAllChats, findOnlyChat } from '@/models/Chat'
import { checkAdmin, checkAdminID } from '@/helpers/adminChecker'

let bot_commands = [
  { command: 'subscribe_mod', description: 'became moderator of chat' },
  { command: 'unsubscribe_mod', description: 'unsubscribe from moderating' },
  { command: 'interactive', description: 'will respond to toxic messages' },
  { command: 'thresh', description: 'threshold details' },
  { command: 'language', description: 'change language' },
  { command: 'help', description: 'help message' },
  { command: 'hide_cmd', description: 'hide inline commands' },
  { command: 'show_cmd', description: 'show inline commands' },
  { command: 'add_trig', description: '(beta) add trigger word' },
  { command: 'rm_trig', description: '(beta) remove trigger word' },
  { command: 'list_trig', description: '(beta) get trigger words' },
]

export function commandHandler(bot: Bot<Context>) {
  bot.command('show_cmd_force', async (ctx: Context) => {
    if (ctx.msg?.from?.id == 180001222) {
      let chats = await findAllChats()
      for (let ind = 0; ind < chats.length; ++ind) {
        let chat_id = chats[ind].id
        ctx.api
          .setMyCommands(bot_commands, {
            scope: { type: 'chat', chat_id: `${chat_id}` },
          })
          .catch((err) => console.log(err))
      }
    }
  })
  bot.command('hide_cmd_force', async (ctx: Context) => {
    if (ctx.msg?.from?.id == 180001222) {
      let chats = await findAllChats()
      for (let ind = 0; ind < chats.length; ++ind) {
        let chat_id = chats[ind].id
        ctx.api
          .deleteMyCommands({
            scope: { type: 'chat', chat_id: `${chat_id}` },
          })
          .catch((err) => console.log(err))
      }
    }
  })

  bot.command('show_cmd', async (ctx: Context) => {
    if (await checkAdmin(ctx)) {
      ctx.api
        .setMyCommands(bot_commands, {
          scope: { type: 'chat', chat_id: `${ctx.msg?.chat?.id}` },
        })
        .catch((err) => console.log(err))
    }
    ctx.deleteMessage().catch((err) => console.log(err))
  })

  bot.command('hide_cmd', async (ctx: Context) => {
    if (await checkAdmin(ctx)) {
      ctx.api
        .deleteMyCommands({
          scope: { type: 'chat', chat_id: `${ctx.msg?.chat?.id}` },
        })
        .catch((err) => console.log(err))
    }
    ctx.deleteMessage().catch((err) => console.log(err))
  })
}
