const path = require('path')
const fs = require('fs')
const key = fs.readFileSync('./.key', 'utf-8')
/*
 * Dota Discord Bot
 *
 * Commando Docs: https://discord.js.org/#/docs/commando/master/general/welcome
 */
const Commando = require('discord.js-commando')
const bot = new Commando.Client()

bot.registry
  // Registers your custom command groups
  .registerGroups([
    ['system', 'System Bot Commands'],
    ['dota', 'OpenDota Commands'],
    ['fun', 'Random Commands']
  ])

  // Registers all built-in groups, commands, and argument types
  .registerDefaults()

  // Registers all of your commands in the ./commands/ directory
  .registerCommandsIn(path.join(__dirname, 'commands'))

bot.on('disconnect', function (msg, code) {
  if (code === 0) return console.error(msg)
  bot.connect()
})

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`)
})

bot.login(key)
