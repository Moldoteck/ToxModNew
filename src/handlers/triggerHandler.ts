import { Bot } from 'grammy'

import Context from '@/models/Context'
import { checkAdmin } from '@/helpers/adminChecker'

export function triggerHandler(bot: Bot<Context>) {
  bot.command('list_trig', async (ctx) => {
    let chat = ctx.dbchat
    ctx.deleteMessage().catch((err) => console.log(err))
    if (await checkAdmin(ctx)) {
      ctx
        .reply(Object.keys(chat.triggers).join(' -- '))
        .catch((err) => console.log(err))
    } else {
      ctx.reply(ctx.i18n.t('not_admin')).catch((err) => console.log(err))
    }
  })

  bot.command('rm_trig', async (ctx) => {
    let chat = ctx.dbchat
    ctx.deleteMessage().catch((err) => console.log(err))
    if (await checkAdmin(ctx)) {
      let reply = ctx.msg.reply_to_message
      if (reply && reply.text) {
        if (reply.text.length < 41) {
          let reply_text = reply.text.toLowerCase()
          delete chat.triggers[reply_text]
          chat.markModified('triggers')
          chat = await (chat as any).save()
          ctx
            .reply(`Removed`, {
              reply_to_message_id: ctx.msg.reply_to_message?.message_id,
            })
            .catch((err) => console.log(err))
        }
      } else {
        ctx.reply('Command should be a reply').catch((err) => console.log(err))
      }
    } else {
      ctx.reply(ctx.i18n.t('not_admin')).catch((err) => console.log(err))
    }
  })

  bot.command('add_trig', async (ctx) => {
    let chat = ctx.dbchat
    ctx.deleteMessage().catch((err) => console.log(err))
    if (await checkAdmin(ctx)) {
      let reply = ctx.msg.reply_to_message
      if (reply && reply.text) {
        if (reply.text.length < 41) {
          if (Object.keys(chat.triggers).length < 50) {
            let reply_text = reply.text.toLowerCase()
            chat.triggers[reply_text] = 0
            chat.markModified('triggers')
            chat = await (chat as any).save()
            ctx
              .reply(`Trigger saved`, {
                reply_to_message_id: ctx.msg.reply_to_message?.message_id,
              })
              .catch((err) => console.log(err))
          }
        }
      } else {
        ctx.reply('Command should be a reply').catch((err) => console.log(err))
      }
    } else {
      ctx.reply(ctx.i18n.t('not_admin')).catch((err) => console.log(err))
    }
  })

  bot.command('add_ignore', async (ctx) => {
    let chat = ctx.dbchat
    ctx.deleteMessage().catch((err) => console.log(err))
    if (await checkAdmin(ctx)) {
      let reply = ctx.msg.reply_to_message
      if (reply && reply.text) {
        if (reply.text.length < 41) {
          if (Object.keys(chat.ignored_triggers).length < 50) {
            chat.ignored_triggers[reply.text.toLowerCase()] = 0
            chat.markModified('ignored_triggers')
            chat = await (chat as any).save()
            ctx
              .reply(`Ignored trigger saved`, {
                reply_to_message_id: ctx.msg.reply_to_message?.message_id,
              })
              .catch((err) => console.log(err))
          }
        }
      } else {
        ctx.reply('Command should be a reply').catch((err) => console.log(err))
      }
    } else {
      ctx.reply(ctx.i18n.t('not_admin')).catch((err) => console.log(err))
    }
  })

  bot.command('rm_ignore', async (ctx) => {
    let chat = ctx.dbchat
    ctx.deleteMessage().catch((err) => console.log(err))
    if (await checkAdmin(ctx)) {
      let reply = ctx.msg.reply_to_message
      if (reply && reply.text) {
        if (reply.text.length < 41) {
          let reply_text = reply.text.toLowerCase()
          delete chat.ignored_triggers[reply_text]
          chat.markModified('ignored_triggers')
          chat = await (chat as any).save()
          ctx
            .reply(`Removed`, {
              reply_to_message_id: ctx.msg.reply_to_message?.message_id,
            })
            .catch((err) => {
              console.log(err)
            })
        }
      } else {
        ctx.reply('Command should be a reply').catch((err) => console.log(err))
      }
    } else {
      ctx.reply(ctx.i18n.t('not_admin')).catch((err) => console.log(err))
    }
  })
}
