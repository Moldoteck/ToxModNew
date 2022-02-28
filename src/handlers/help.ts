import Context from '@/models/Context'
import sendOptions from '@/helpers/sendOptions'

export function handleHelp(ctx: Context) {
  return ctx.replyWithLocalization('help', sendOptions(ctx))
}

export function handleStart(ctx: Context) {
  return ctx.replyWithLocalization('start', sendOptions(ctx))
}

export function handleThresh(ctx: Context) {
  return ctx.replyWithLocalization('thresh', sendOptions(ctx))
}
