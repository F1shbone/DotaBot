/*
 *
 *
 */

const Discord = require('discord.js')
const Commando = require('discord.js-commando')
const Logger = require('../../logger')

class TestCommand extends Commando.Command {
  constructor (client) {
    super(client, {
      name: 'test',
      memberName: 'test',
      group: 'test',
      description: 'Testcommand',
      examples: [ 'test' ]
    })
  }

  async run (message, args) {
    // let channel = message.channel
    // let webhooks = await channel.fetchWebhooks()
    // console.log(webhooks)

    // const hook = new Discord.WebhookClient('392686247358889984', 'oFrYehI-cZH3L4co8C2xyBOTWmTqPyZ2zP9R81EL4Od7SEEAVDZdXB6Wc_GULc3ooYII')
    // hook.send('I am now alive!')

    console.log('---- Test finished ----')
  }
}

module.exports = TestCommand
