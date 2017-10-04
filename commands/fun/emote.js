const path = require('path')

/*
 *
 *
 */
const Commando = require('discord.js-commando')
const Logger = require('../../logger')
const SQLite3 = require('sqlite3').verbose()
const SoundManager = require('./soundmanager')

class EmoteCommand extends Commando.Command {
  constructor (client) {
    super(client, {
      name: 'emote',
      memberName: 'emote',
      group: 'fun',
      description: 'Play some sound',
      examples: [ 'emote [type]' ]
    })

    this.DB = new SQLite3.Database(path.join(__dirname, '..', 'db.sqlite'))
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
      Logger.error('\'!sound stop\' does not work in direct messages!', message)
      return
    }

    SoundManager.stop()
  }

  /**
   * Play sound file from server
   * @param {CommandMessage} message
   * @param {string} args
   */
  async playSound (message, args) {
    if (message.member === null) {
      Logger.error('\'!sound <id>/<name>\' does not work in direct messages!', message)
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
        Logger.error(`Sound "${args || 'undefined'}" not found`, message)
        return
      }

      try {
        let sound = rows[0]
        let voiceChannel = message.member.voiceChannel

        if (voiceChannel) {
          await SoundManager.setVoiceChannel(voiceChannel)
          SoundManager.play('emote', sound.name)
        } else {
          Logger.error('You need to be in a voice channel for this command!', message)
        }
      } catch (error) {
        console.log('Error occured!')
        console.log(error)
      }
    })
  }
}

module.exports = EmoteCommand
