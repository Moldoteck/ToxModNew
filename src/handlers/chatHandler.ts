const { google } = require('googleapis')
import { Bot } from 'grammy'

import Context from '@/models/Context'
import { findAllChats, findOnlyChat } from '@/models/Chat'
import { checkAdmin, checkAdminID } from '@/helpers/adminChecker'

let perspective_link =
  'https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1'

type textObjType = {
  [key: string]: string
}

let response_score_map: textObjType = {
  toxic_score: 'toxic_msg',
  profan_score: 'profan_msg',
  insult_score: 'insult_msg',
  identity_score: 'identity_msg',
}

let response_notification: textObjType = {
  toxic_score: 'toxic_notification',
  profan_score: 'profan_notification',
  insult_score: 'insult_notification',
  identity_score: 'identity_notification',
}

function delay(scnd: number) {
  return new Promise((resolve) => setTimeout(resolve, scnd * 1000))
}
const allAttributes: Object = {
  TOXICITY: { scoreType: 'PROBABILITY' },
  PROFANITY: { scoreType: 'PROBABILITY' },
  IDENTITY_ATTACK: { scoreType: 'PROBABILITY' },
  INSULT: { scoreType: 'PROBABILITY' },
}

class dataObject {
  constructor(
    comment_msg: string,
    requestedAttributes: Object = allAttributes,
    languages: Array<string> = ['en'],
    doNotStore: boolean = true
  ) {
    this.comment = {
      text: comment_msg,
    }
    this.requestedAttributes = requestedAttributes
    this.languages = languages
    this.doNotStore = doNotStore
  }

  comment: Object
  requestedAttributes: Object
  languages: Array<string>
  doNotStore: boolean
}

async function analyzeComment(
  client: any,
  requestData: Object,
  depth = 0
): Promise<any> {
  let response = undefined
  if (depth > 120) {
    console.log('Analysis wait time exceeded')
    return undefined
  }
  try {
    response = await client.comments.analyze({
      key: process.env.PERSPECTIVEKEY,
      resource: requestData,
    })
  } catch (err: any) {
    if (err.message.includes('Quota exceeded for quota metric')) {
      await delay(1)
      response = await analyzeComment(client, requestData, depth + 1)
    } else {
      console.log('Error stack: ', err.stack)
      console.log('Error name: ', err.name)
      console.log('Error message: ', err.message)
      response = undefined
    }
  }
  return response
}

async function getToxicityResult(requestData: Object) {
  let client = undefined

  let toxic_score: number = 0
  let profan_score: number = 0
  let insult_score: number = 0
  let identity_score: number = 0

  try {
    client = await google.discoverAPI(perspective_link)
  } catch (err: any) {
    console.log('Error stack: ', err.stack)
    console.log('Error name: ', err.name)
    console.log('Error message: ', err.message)
    return undefined
  }
  let response = await analyzeComment(client, requestData)

  try {
    console.log(response.data.attributeScores)
    let attr_scores = response.data.attributeScores
    toxic_score = attr_scores.TOXICITY.summaryScore.value
    profan_score = attr_scores.PROFANITY.summaryScore.value
    insult_score = attr_scores.INSULT.summaryScore.value
    identity_score = attr_scores.IDENTITY_ATTACK.summaryScore.value
  } catch (err: any) {
    console.log('Error stack: ', err.stack)
    console.log('Error name: ', err.name)
    console.log('Error message: ', err.message)
    return undefined
  }

  type resultType = {
    [key: string]: number
  }

  let result: resultType = {
    toxic_score: toxic_score,
    profan_score: profan_score,
    insult_score: insult_score,
    identity_score: identity_score,
  }

  return result
}

async function customMessage(
  message: string,
  context: Context,
  chatid: number
) {
  try {
    await context.api.sendMessage(chatid, message)
  } catch (err: any) {
    let msg = '' + err.message
    if (msg.includes('retry after')) {
      let st = msg.indexOf('retry after') + 'retry after '.length
      msg = msg.substring(st).split(' ')[0]
      await delay(parseInt(msg))
      await customMessage(message, context, chatid)
    } else {
      console.log('Error', err.stack)
      console.log('Error', err.name)
      console.log('Error', err.message)
    }
  }
}

async function customReply(message: string, context: Context) {
  try {
    await context.reply(message, {
      reply_to_message_id: context?.message?.message_id,
    })
  } catch (err: any) {
    let msg = '' + err.message
    if (msg.includes('retry after')) {
      let st = msg.indexOf('retry after') + 'retry after '.length
      msg = msg.substring(st).split(' ')[0]
      await delay(parseInt(msg))
      await customReply(message, context)
    } else {
      console.log('Error', err.stack)
      console.log('Error', err.name)
      console.log('Error', err.message)
    }
  }
}

async function modReply(mod: number, message: string, context: Context) {
  try {
    await context.api.sendMessage(mod, message, {
      disable_notification: true,
    })
  } catch (err: any) {
    let msg = '' + err.message
    if (msg.includes('retry after')) {
      let st = msg.indexOf('retry after') + 'retry after '.length
      msg = msg.substring(st).split(' ')[0]
      await delay(parseInt(msg))
      await modReply(mod, message, context)
    } else {
      console.log('Error', err.stack)
      console.log('Error', err.name)
      console.log('Error', err.message)
    }
  }
}

export function chatHandler(bot: Bot<Context>) {
  bot.command('sendall', async (ctx) => {
    if (ctx.from?.id == 180001222) {
      let reply = ctx.msg.reply_to_message
      if (reply) {
        if (reply.text) {
          let allchats = await findAllChats()
          for (let chat of allchats) {
            try {
              let actualChat = await ctx.api.getChat(chat.id)
              if (
                ['group', 'supergroup', 'private'].includes(actualChat.type)
              ) {
                await customMessage(reply.text, ctx, chat.id)
              }
            } catch (err: any) {
              console.log(err.message)
            }
          }
        }
      }
    }
    ctx.deleteMessage().catch((err) => console.log(err))
  })

  bot.command('toxicscore', async (ctx) => {
    let reply = ctx.msg.reply_to_message
    if (reply != undefined && reply.text != undefined) {
      let data = new dataObject(
        reply.text,
        ['cs', 'es', 'fr', 'ko', 'nl', 'pl'].includes(ctx.i18n.t('short_name'))
          ? { TOXICITY: { scoreType: 'PROBABILITY' } }
          : allAttributes,
        [ctx.i18n.t('short_name')],
        true
      )

      let result = await getToxicityResult(data)
      if (result) {
        var keys: Array<string> = Object.keys(result)
        var max = result[keys[0]]
        var max_index = 0
        var i

        for (i = 1; i < keys.length; i++) {
          var value = result[keys[i]]
          if (value > max) {
            max = value
            max_index = i
          }
        }
        let msg = response_score_map[keys[max_index]]
        ctx
          .reply(`${ctx.i18n.t(msg)} ${Math.trunc(100 * max)}%`, {
            reply_to_message_id: ctx.msg.reply_to_message?.message_id,
          })
          .catch((err) => {
            console.log(err)
          })
      }
    }
    ctx.deleteMessage().catch((err) => {
      console.log(err)
    })
  })

  bot.command('toxicscorefull', async (ctx) => {
    let reply = ctx.msg.reply_to_message
    if (reply) {
      if (reply.text) {
        let result = await getToxicityResult(
          new dataObject(
            reply.text,
            ['cs', 'es', 'fr', 'ko', 'nl', 'pl'].includes(
              ctx.i18n.t('short_name')
            )
              ? { TOXICITY: { scoreType: 'PROBABILITY' } }
              : allAttributes,
            [ctx.i18n.t('short_name')],
            true
          )
        )
        if (result) {
          for (let key in result) {
            result[key] = Math.trunc(100 * result[key])
          }

          ctx
            .reply(`${JSON.stringify(result, null, 2)}`, {
              reply_to_message_id: ctx.msg.reply_to_message?.message_id,
            })
            .catch((err) => console.log(err))
        }
      }
    }
    ctx.deleteMessage().catch((err) => console.log(err))
  })

  bot.command('subscribe_mod', async (ctx) => {
    let chat = ctx.dbchat
    let user_id = ctx.from?.id
    ctx.deleteMessage().catch((err) => console.log(err))
    if (user_id && !chat.moderators.includes(user_id)) {
      if (await checkAdmin(ctx)) {
        let private_chat = await findOnlyChat(user_id)
        if (private_chat) {
          chat.moderators.push(user_id)
          chat = await (chat as any).save()
          ctx.reply('Ok').catch((err) => console.log(err))
        } else {
          ctx.reply(ctx.i18n.t('chat_missing')).catch((err) => console.log(err))
        }
      } else {
        ctx.reply(ctx.i18n.t('not_admin')).catch((err) => console.log(err))
      }
    } else {
      ctx.reply(ctx.i18n.t('subscribed')).catch((err) => console.log(err))
    }
  })

  bot.command('unsubscribe_mod', async (ctx) => {
    let chat = ctx.dbchat
    let user_id = ctx.from?.id
    ctx.deleteMessage().catch((err) => console.log(err))
    if (user_id && chat.moderators.includes(user_id)) {
      chat.moderators.splice(chat.moderators.indexOf(user_id), 1)
      chat = await (chat as any).save()
      ctx.reply('Ok').catch((err) => console.log(err))
    } else {
      ctx.reply(ctx.i18n.t('unsubscribed')).catch((err) => console.log(err))
    }
  })

  bot.command('countChats', async (ctx) => {
    if (ctx.msg.from?.id == 180001222) {
      let chats = await findAllChats()
      let users_tot = 0
      let chat_nr = 0
      let users_pr = 0
      for (let element of chats) {
        try {
          users_tot += await ctx.api.getChatMemberCount(element.id)
          chat_nr += 1
        } catch (err) {
          console.log(err)
          users_pr += 1
        }
      }
      ctx
        .reply(
          'Total users ' +
            users_tot +
            '\nPrivate Users ' +
            users_pr +
            '\nChats ' +
            chat_nr
        )
        .catch((err) => console.log(err))
    }
  })

  bot.command('interactive', async (ctx) => {
    let chat = ctx.dbchat
    let user_id = ctx.from?.id
    ctx.deleteMessage().catch((err) => console.log(err))
    if ((await checkAdmin(ctx)) && user_id) {
      let private_chat = await findOnlyChat(user_id)
      if (private_chat) {
        chat.interactive = !chat.interactive
        chat = await (chat as any).save()
        ctx
          .reply(`${ctx.i18n.t('interactive')} ${chat.interactive}`)
          .catch((err) => console.log(err))
      } else {
        ctx.reply(ctx.i18n.t('chat_missing')).catch((err) => console.log(err))
      }
    } else {
      ctx.reply(ctx.i18n.t('not_admin')).catch((err) => console.log(err))
    }
  })

  bot.on('message:text', async (ctx) => {
    if (ctx.msg && ctx.msg.text) {
      let triggers = Object.keys(ctx.dbchat.triggers)
      let ignored_triggers = Object.keys(ctx.dbchat.ignored_triggers)
      let small_message = ctx.msg.text.toLowerCase()
      for (let ignored of ignored_triggers) {
        let rg = new RegExp(`${ignored}`, 'ig')
        small_message = small_message.replace(rg, '')
      }
      if (small_message.length == 0) {
        return
      }
      let triggerDetected = false
      for (let element of triggers) {
        if (small_message.includes(element)) {
          triggerDetected = true
          break
        }
      }

      if (triggerDetected) {
        ctx.dbchat.moderators.forEach(async (moderator_id) => {
          try {
            let chat_info = await ctx.getChat()
            if (chat_info && 'username' in chat_info) {
              let tt =
                'https://t.me/' + chat_info.username + '/' + ctx.msg?.message_id
              modReply(moderator_id, tt, ctx)
            } else if (chat_info && !('username' in chat_info)) {
              customReply(
                'Group is not public (it should have t.me/... link)',
                ctx
              )
            }
          } catch (err) {
            console.log(err)
          }
        })
      }

      let data = new dataObject(
        small_message,
        ['cs', 'es', 'fr', 'ko', 'nl', 'pl'].includes(ctx.i18n.t('short_name'))
          ? { TOXICITY: { scoreType: 'PROBABILITY' } }
          : allAttributes,
        [ctx.i18n.t('short_name')],
        true
      )
      // for(let ind=0;ind<250;++ind){
      //   let result = await getToxicityResult(data)
      // }
      let result = await getToxicityResult(data)

      if (result) {
        if (
          result.toxic_score > ctx.dbchat.toxic_thresh ||
          result.profan_score > ctx.dbchat.profan_thresh ||
          result.insult_score > ctx.dbchat.insult_thresh ||
          result.identity_score > ctx.dbchat.identity_thresh
        ) {
          var keys = Object.keys(result)
          var max = result[keys[0]]
          var max_index = 0
          var i

          for (i = 1; i < keys.length; i++) {
            var value = result[keys[i]]
            if (value > max) {
              max = value
              max_index = i
            }
          }

          if (ctx.dbchat.interactive) {
            let msg = response_notification[keys[max_index]]
            customReply(ctx.i18n.t(msg), ctx)
          }

          let chat = ctx.dbchat
          //delete users that are not admins anymore
          let todelete = []
          for (let mod_id of chat.moderators) {
            if (!(await checkAdminID(ctx, mod_id))) {
              todelete.push(mod_id)
            }
          }
          for (let mod_id of todelete) {
            chat.moderators.splice(chat.moderators.indexOf(mod_id), 1)
            chat = await (chat as any).save()
          }

          chat.moderators.forEach(async (moderator_id) => {
            try {
              let chat_info = await ctx.getChat()
              if (chat_info && 'username' in chat_info) {
                let tt =
                  'https://t.me/' +
                  chat_info.username +
                  '/' +
                  ctx.msg?.message_id
                modReply(moderator_id, tt, ctx)
              } else if (chat_info && !('username' in chat_info)) {
                customReply(
                  'Group is not public (it should have t.me/... link)',
                  ctx
                )
              }
            } catch (err) {
              console.log(err)
            }
          })
        }
      }
    }
  })
}

function deleteStrings(input: string, strings: Array<string>) {
  strings.forEach((element) => {
    input = replaceAll(input, element)
  })
  return input
}
function replaceAll(input: string, what: string, substitute: string = '') {
  return input.split(what).join(substitute)
}
