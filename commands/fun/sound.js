const path = require('path')

/*
 *
 *
 */
const Commando = require('discord.js-commando')
const Helpers = require('../../helpers')
const SQLite3 = require('sqlite3').verbose()

class SoundCommand extends Commando.Command {
  constructor (client) {
    super(client, {
      name: 'sound',
      memberName: 'sound',
      group: 'fun',
      description: 'Play some sound',
      examples: [ 'sound [name]' ]
    })

    this.DB = new SQLite3.Database(path.join(__dirname, 'db.sqlite'))
    this.connection = null
    this.dispatcher = null
  }

  async run (message, args) {
    args = args.toLowerCase()
    let command = args
    let param

    if (args.indexOf(' ') !== -1) {
      command = args.substr(0, args.indexOf(' '))
      param = args.substr(args.indexOf(' ') + 1)
    }

    switch (command) {
      case 'list': await this.listItems(message, param); break
      case 'random': await this.randomSound(message, param); break
      case 'stop': await this.stopSound(message); break
      default: await this.playSound(message, args); break
    }
  }

  /**
   * Lists all Categories if no category is entered, or all available soundfiles in given category
   * @param {CommandMessage} message
   * @param {string} category (optional)
   */
  async listItems (message, category) {
    let sql
    if (category === undefined) {
      sql = 'SELECT * FROM Category'
    } else {
      sql = `
        SELECT f.*
        FROM
          Files as f,
          Category as c
        WHERE
          f.category_id == c.id
          AND c.name == '${category}'
      `
    }

    this.DB.all(sql, async (err, rows) => {
      if (!err) {
        let output = 'Available ' + (category ? 'Sounds' : 'Categories') + ':```'
        for (let i = 0; i < rows.length; i++) {
          if (category) {
            output += '\n- ' + rows[i].name + ' (' + rows[i].id + ') - ' + rows[i].duration
          } else {
            output += '\n- ' + rows[i].name
          }
        }
        output += '```'

        let dm = await message.author.createDM()
        dm.send(output)
      }
    })
  }

  /**
   * Play random sound
   * @param {CommandMessage} message
   * @param {string} category
   */
  async randomSound (message, category) {
    if (message.member === null) {
      message.channel.send('**ERROR:** \'!sound random\' does not work in direct messages!')
      return
    }

    let sql
    if (category === undefined) {
      sql = 'SELECT F.*, C.name as category_name FROM Files As F, Category As C WHERE F.category_id == C.id ORDER BY RANDOM() LIMIT 1'
    } else {
      sql = 'SELECT F.*, C.name as category_name FROM Files As F, Category As C WHERE F.category_id == C.id AND C.name == \'' + category + '\' ORDER BY RANDOM() LIMIT 1'
    }

    let self = this
    this.DB.all(sql, async (err, rows) => {
      if (!err) {
        await message.channel.send(`Playing sound '${rows[0].name} (${rows[0].id})' from Category '${rows[0].category_name}'`)
        await self.playSound(message, rows[0].id)
      } else {
        console.error(err)
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
      SELECT F.*, C.Name As category_name
      FROM
        Files As F,
        Category As C
      WHERE
        F.category_id == C.id AND
        (
          F.name == '${args}' OR
          F.id == '${args}'
        )
    `, async (err, rows) => {
      if (err || rows.length === 0) {
        message.channel.send(`Sound "${args || 'undefined'}" not found`)
        return
      }

      try {
        let sound = rows[0]
        let file = path.join(__dirname, 'files', sound.category_name, sound.name + '.mp3')

        let voiceChannel = message.member.voiceChannel
        let inChannel = await Helpers.inVoiceChannel(voiceChannel.members)

        if (!inChannel || self.connection === null) {
          if (self.connection) self.connection.disconnect()
          self.connection = await voiceChannel.join()
        }

        self.dispatcher = self.connection.playFile(file)

        // console.log(file)
      } catch (error) {
        console.log('Error occured!')
        console.log(error)
      }
    })
  }
}

module.exports = SoundCommand