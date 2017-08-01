const path = require('path')

/*
 *
 *
 */
const Commando = require('discord.js-commando')
const Helpers = require('../../helpers')
const SQLite3 = require('sqlite3').verbose()

class EmoteCommand extends Commando.Command {
  constructor (client) {
    super(client, {
      name: 'emote',
      memberName: 'emote',
      group: 'fun',
      description: 'Play some sound',
      examples: [ 'emote [type]' ]
    })

    this.DB = new SQLite3.Database(path.join(__dirname, 'db.sqlite'))
    this.connection = null
    this.dispatcher = null
  }

  async run (message, args) {
    args = args.toLowerCase()

    switch (args) {
      case 'list': await this.listItems(message); break
      case 'stop': await this.stopSound(message); break
      default: await this.playSound(message, args); break
    }
  }

  /**
   * Lists all Categories if no category is entered, or all available soundfiles in given category
   * @param {CommandMessage} message
   * @param {string} category (optional)
   */
  async listItems (message) {
    this.DB.all(`SELECT name FROM SecondaryCategory`, async (err, rows) => {
      if (!err) {
        let output = 'Available Emotes:```'
        for (let i = 0; i < rows.length; i++) {
          output += '\n- ' + rows[i].name
        }
        output += '```'

        let dm = await message.author.createDM()
        dm.send(output)
      }
    })
  }

  /**
   * Stops currently playing sound
   * @param {CommandMessage} message
   */
  async stopSound (message) {
    if (message.member === null) {
      message.channel.send('**ERROR:** \'!sound stop\' does not work in direct messages!')
      return
    }

    if (this.dispatcher) this.dispatcher.end()
  }

  /**
   * Play sound file from server
   * @param {CommandMessage} message
   * @param {string} args
   */
  async playSound (message, args) {
    if (message.member === null) {
      message.channel.send('**ERROR:** \'!sound <id>/<name>\' does not work in direct messages!')
      return
    }

    let self = this
    self.DB.all(`
      SELECT f.*
      FROM
        Files as f,
        SecondaryCategory as c
      WHERE
        f.other_id = c.id
        AND c.name = '${args}'
      ORDER BY RANDOM() LIMIT 1
    `, async (err, rows) => {
      if (err || rows.length === 0) {
        message.channel.send(`Sound "${args || 'undefined'}" not found`)
        return
      }

      try {
        let sound = rows[0]
        let file = path.join(__dirname, 'files', 'emote', sound.name + '.mp3')

        let voiceChannel = message.member.voiceChannel

        if (voiceChannel) {
          let inChannel = await Helpers.inVoiceChannel(voiceChannel.members)
          if (!inChannel || self.connection === null) {
            if (self.connection) self.connection.disconnect()
            self.connection = await voiceChannel.join()
          }

          self.dispatcher = self.connection.playFile(file)
        } else {
          message.channel.send('You need to be in a voice channel for this command!')
        }
      } catch (error) {
        console.log('Error occured!')
        console.log(error)
      }
    })
  }
}

module.exports = EmoteCommand
