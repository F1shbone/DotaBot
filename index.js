const path = require('path')
const fs = require('fs')
const KEY = fs.readFileSync(path.join(__dirname, '.key'), 'utf-8')
/*
 * Dota Discord Bot
 *
 * Commando Docs: https://discord.js.org/#/docs/commando/master/general/welcome
 */
const Commando = require('discord.js-commando')
const ChannelWatcher = require('./lib/channelWatcher')

const guild = '209050930123898880'
const owner = '209050492330967040'
const bot = new Commando.Client({
  owner
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
  bot.user.setPresence({
    game: {
      name: 'DOTA 2',
      type: 0
    }
  })
  new ChannelWatcher(bot, guild)
  console.log(`Logged in as ${bot.user.tag}!`)
})

bot.on('guildMemberVoiceChannelChanged', data => {
  if (
    data.guildMember.presence.status === 'idle' &&
    data.oldVoice.id === '209050930669289472' &&
    data.newVoice.id === '209281892262871040'
  ) {
    // console.log(data)
    data.guildMember.setVoiceChannel(data.oldVoice.channel)
  }
})

bot.login(KEY)