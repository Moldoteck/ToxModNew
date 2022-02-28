import { NextFunction } from 'grammy'
import { findOrCreateChat } from '@/models/Chat'
import Context from '@/models/Context'

export default async function attachChat(ctx: Context, next: NextFunction) {
  if (!ctx.chat) {
    throw new Error('No from field found')
  }
  const chat = await findOrCreateChat(ctx.chat.id)
  if (!chat) {
    throw new Error('Chat not found')
  }
  ctx.dbchat = chat
  return next()
}
