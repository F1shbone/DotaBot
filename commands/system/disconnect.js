/*
 *
 *
 */

const Commando = require('discord.js-commando')
const Logger = require('../../logger')
const SoundManager = require('../fun/soundmanager')

class DisconnectCommand extends Commando.Command {
  constructor (client) {
    super(client, {
      name: 'disconnect',
      memberName: 'disconnectroll',
      group: 'system',
      description: 'Disconnect Bot from Voicechannel',
      examples: [ 'disconnect' ]
    })
  }

  async run (message, args) {
    SoundManager.leave()
    Logger.info('Disconnected from Voicechannel', message)
  }
}

module.exports = DisconnectCommand
