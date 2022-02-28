import Context from '@/models/Context'
import { Chat } from '@/models/Chat'
import { checkAdmin } from '@/helpers/adminChecker'

import { DocumentType } from '@typegoose/typegoose'
import { Bot } from 'grammy'

let default_vals = {
  toxic_thresh: 0.65,
  profan_thresh: 0.7,
  insult_thresh: 0.6,
  identity_thresh: 0.7,
}

export function treshHandler(bot: Bot<Context>) {
  bot.command('setthresh', async (ctx: Context) => {
    let isAdmin = await checkAdmin(ctx)
    if (isAdmin) {
      if (ctx.msg?.text) {
        let result = await setVal(ctx.dbchat, ctx.msg.text)
        ctx
          .reply(`${result}`, { reply_to_message_id: ctx?.message?.message_id })
          .catch((err) => console.log(err))
      }
    }

    ctx.deleteMessage().catch((err) => console.log(err))
  })

  bot.command('resetthresh', async (ctx: Context) => {
    let isAdmin = await checkAdmin(ctx)
    if (isAdmin) {
      await resetVals(ctx.dbchat)
      ctx
        .reply(
          `${ctx.i18n.t('default_thresh')}:\n${JSON.stringify(
            default_vals,
            null,
            2
          )}`,
          { reply_to_message_id: ctx?.message?.message_id }
        )
        .catch((err) => console.log(err))
    }
    ctx.deleteMessage().catch((err) => console.log(err))
  })

  bot.command('getthresh', async (ctx: Context) => {
    let isAdmin = await checkAdmin(ctx)
    let thresh = {
      toxic_thresh: ctx.dbchat.toxic_thresh,
      profan_thresh: ctx.dbchat.profan_thresh,
      insult_thresh: ctx.dbchat.insult_thresh,
      identity_thresh: ctx.dbchat.identity_thresh,
    }
    ctx
      .reply(
        `${ctx.i18n.t('thresh_info')}:\n${JSON.stringify(thresh, null, 2)}`,
        { reply_to_message_id: ctx?.message?.message_id }
      )
      .catch((err) => console.log(err))
    ctx.deleteMessage().catch((err) => console.log(err))
  })
}

async function setVal(dbchat: DocumentType<Chat>, message_text: string) {
  let elements = message_text.split(' ')
  let error_msg = 'Done'
  if (elements.length == 3) {
    let thresh_type = elements[1]
    if (['toxic', 'profan', 'identity', 'insult'].includes(thresh_type)) {
      try {
        let thresh_val = parseFloat(elements[2])
        if (thresh_val != NaN && thresh_val <= 1 && thresh_val >= 0) {
          switch (thresh_type) {
            case 'toxic':
              dbchat.toxic_thresh = thresh_val
              break
            case 'profan':
              dbchat.profan_thresh = thresh_val
              break
            case 'identity':
              dbchat.identity_thresh = thresh_val
              break
            case 'insult':
              dbchat.insult_thresh = thresh_val
          }
          dbchat = await (dbchat as any).save()
        } else {
          error_msg = 'Number should be between 0 and 1'
        }
      } catch (err) {
        console.log(err)
      }
    } else {
      error_msg = 'Thresh should be one of: toxic, profan, identity, insult'
    }
  } else {
    error_msg = 'Something is wrong. See /help for usage'
  }
  return error_msg
}

async function resetVals(dbchat: DocumentType<Chat>) {
  dbchat.toxic_thresh = default_vals.toxic_thresh
  dbchat.profan_thresh = default_vals.profan_thresh
  dbchat.insult_thresh = default_vals.insult_thresh
  dbchat.identity_thresh = default_vals.identity_thresh
  dbchat = await (dbchat as any).save()
}
