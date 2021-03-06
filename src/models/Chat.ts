import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

@modelOptions({ schemaOptions: { timestamps: true } })
export class Chat {
  @prop({ required: true, index: true, unique: true })
  id!: number

  @prop({ required: true, default: 'en' })
  language!: string

  @prop({ required: true, default: 0.65 })
  toxic_thresh!: number

  @prop({ required: true, default: 0.7 })
  profan_thresh!: number

  @prop({ required: true, default: 0.7 })
  identity_thresh!: number

  @prop({ required: true, default: 0.6 })
  insult_thresh!: number

  @prop({ required: false, default: [] })
  moderators!: Array<number>

  @prop({ required: true, default: true })
  interactive!: boolean

  @prop({ required: true, default: {} })
  triggers!: { [key: string]: number }

  @prop({ required: true, default: {} })
  ignored_triggers!: { [key: string]: number }
}

// Get Chat model
const ChatModel = getModelForClass(Chat)

// Get or create chat
export function findOrCreateChat(id: number) {
  return ChatModel.findOneAndUpdate(
    { id },
    {},
    {
      upsert: true,
      new: true,
    }
  )
}

export async function findOnlyChat(id: number) {
  return await ChatModel.findOne({ id })
}

export async function findAllChats() {
  return await ChatModel.find({})
}

export async function countChats() {
  return await ChatModel.countDocuments({})
}
