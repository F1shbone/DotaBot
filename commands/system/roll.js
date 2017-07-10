/*
 * 
 * 
 */

const Commando = require('discord.js-commando')

class RollCommand extends Commando.Command {
    constructor (client) {
    super(client, {
      name: 'roll',
      memberName: 'roll',
      group: 'system',
      description: 'Roll a Die',
      examples: [ 'roll', 'roll 20', 'roll 100' ]
    })
  }

  async run (message, args) {
    let sides = 6
    if (!isNaN(args) && args !== '') sides = parseInt(args)

    message.delete()
    message.channel.send(`${message.author} rolled a ${Math.floor(Math.random() * sides) + 1} on a ${sides} sided die!`)
  }
}

module.exports = RollCommand