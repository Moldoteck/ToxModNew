import Context from '@/models/Context'
import { ChatMember } from 'grammy/out/platform.node'

export async function checkAdmin(ctx: Context) {
  let isAdmin = false
  if (ctx.chat?.type == 'group' || ctx.chat?.type == 'supergroup') {
    let chat_admins: Array<ChatMember> = await ctx.getChatAdministrators()
    let chat_admins_id = chat_admins.map(({ user }) => user.id)

    if (ctx.from != undefined) {
      if (chat_admins_id.indexOf(ctx.from.id) != -1) {
        isAdmin = true
      }
    }
  }
  if (ctx.chat?.type == 'private') {
    isAdmin = true
  }
  return isAdmin
}

export async function checkAdminID(ctx: Context, adminID: number) {
  let isAdmin = false
  if (ctx.chat?.type == 'group' || ctx.chat?.type == 'supergroup') {
    let chat_admins: Array<ChatMember> = await ctx.getChatAdministrators()
    let chat_admins_id = chat_admins.map(({ user }) => user.id)

    if (chat_admins_id.indexOf(adminID) != -1) {
      isAdmin = true
    }
  }
  if (ctx.chat?.type == 'private') {
    isAdmin = true
  }
  return isAdmin
}
