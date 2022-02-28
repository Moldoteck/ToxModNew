import 'module-alias/register'
import 'reflect-metadata'
import 'source-map-support/register'

import { ignoreOld, sequentialize } from 'grammy-middlewares'
import { run } from '@grammyjs/runner'
import attachUser from '@/middlewares/attachUser'
import bot from '@/helpers/bot'
import configureI18n from '@/middlewares/configureI18n'
import handleLanguage from '@/handlers/language'
import i18n from '@/helpers/i18n'
import languageMenu from '@/menus/language'
import { handleHelp, handleStart, handleThresh } from '@/handlers/help'
import startMongo from '@/helpers/startMongo'
import { triggerHandler } from './handlers/triggerHandler'
import { treshHandler } from './handlers/treshHandler'
import { commandHandler } from './handlers/commandHandler'
import { chatHandler } from './handlers/chatHandler'
import attachChat from './middlewares/attachChat'

async function runApp() {
  console.log('Starting app...')
  // Mongo
  await startMongo()
  console.log('Mongo connected')
  bot
    // Middlewares
    .use(sequentialize())
    .use(ignoreOld())
    .use(attachUser)
    .use(attachChat)
    .use(i18n.middleware())
    .use(configureI18n)
    // Menus
    .use(languageMenu)
  // Commands
  bot.command('help', handleHelp)
  bot.command('start', handleStart)
  bot.command('thresh', handleThresh)
  bot.command('language', handleLanguage)
  triggerHandler(bot)
  treshHandler(bot)
  commandHandler(bot)
  chatHandler(bot)
  // Errors
  bot.catch(console.error)
  // Start bot
  await bot.init()
  run(bot)
  console.info(`Bot ${bot.botInfo.username} is up and running`)
}

void runApp()