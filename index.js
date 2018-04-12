const path = require('path')
const fs = require('fs')
const KEY = fs.readFileSync(path.join(__dirname, '.key'), 'utf-8')
/*
 * Dota Discord Bot
 *
 * Commando Docs: https://discord.js.org/#/docs/commando/master/general/welcome
 */
const Commando = require('discord.js-commando')
const bot = new Commando.Client({
  owner: '209050492330967040'
})

bot.registry
  // Registers your custom command groups
  .registerGroups([
    ['system', 'System Bot Commands'],
    ['dota', 'OpenDota Commands'],
    ['fun', 'Random Commands'],
    ['test', 'Group of Test Commands']
  ])

  // Registers all built-in groups, commands, and argument types
  .registerDefaults()

  // Registers all of your commands in the ./commands/ directory
  .registerCommandsIn(path.join(__dirname, 'commands'))

bot.on('disconnect', function (msg, code) {
  if (code === 0) return console.error(msg)
  bot.login(KEY)
})

bot.on('ready', () => {
  bot.user.setPresence({ game: { name: 'DOTA 2', type: 0 } })
  console.log(`Logged in as ${bot.user.tag}!`)
})

bot.login(KEY)
