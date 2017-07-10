const path = require('path')
const fs = require('fs')
const key = fs.readFileSync('./.key', 'utf-8')
/*
 * Dota Discord Bot
 * 
 * Commando Docs: https://discord.js.org/#/docs/commando/master/general/welcome
 */
const Discord = require('discord.js')
const Commando = require('discord.js-commando')
const bot = new Commando.Client()
const channels = []

bot.registry
  // Registers your custom command groups
  .registerGroups([
    ['system', 'System Bot Commands'],
    ['dota', 'OpenDota Commands'],
    ['sounds', 'Play some sweet sounds']
  ])

  // Registers all built-in groups, commands, and argument types
  .registerDefaults()

  // Registers all of your commands in the ./commands/ directory
  .registerCommandsIn(path.join(__dirname, 'commands'))

bot.on('disconnect', function(msg, code) {
  if (code === 0) return console.error(msg);
  bot.connect();
})

bot.on('ready', () => {
  channels.push({
    name: 'General',
    underlyingObject: bot.channels.get('209050930669289472'),
    users: [],
    snowflakes: []
  })
  channels.push({
    name: 'Dota 1',
    underlyingObject: bot.channels.get('332547725373472778'),
    users: [],
    snowflakes: []
  })
  channels.push({
    name: 'Dota 2',
    underlyingObject: bot.channels.get('332547755572592645'),
    users: [],
    snowflakes: []
  })

  bot.setInterval(() => {
    let output = bot.channels.get('331556812622921728')
    let channel = channels[0]
    let users = channel.underlyingObject.members


    // let notifications = []
    // bot.user.createGroupDM([
    //   { 
    //     user: '209050492330967040',
    //     nick: 'Fishbone'
    //   }
    // ])
    // .then((dm) => {
    //   users.forEach((elem, key) => {
    //     console.log('Test1')
    //     dm.addUser(key)
    //     console.log('Test2')
    //     if (!channel.snowflakes.includes(key)) {
    //       channel.snowflakes.push(key)
    //       channel.users.push(elem.user.username)
    //     }
    //   })
    // })
    // .then(() => {
    //   channel.users.forEach((elem, key) => {
    //       dm.send(`${elem} tritt dem Gespräch bei`, { tts: true } ).then((msg) => { msg.delete() })
    //   })
    // })
    // .catch((err) => {
    //   console.error(err)
    // })
  }, 1000)

  console.log(`Logged in as ${bot.user.tag}!`)
})

bot.login(key)