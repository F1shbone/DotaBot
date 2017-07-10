const path = require('path')

/*
 * 
 * 
 */
const Discord = require('discord.js')
const Commando = require('discord.js-commando')
const Helpers = require('../../helpers')
const SQLite3 = require('sqlite3').verbose()

class SoundCommand extends Commando.Command {
  constructor (client) {
    super(client, {
      name: 'sound',
      memberName: 'sound',
      group: 'sounds',
      description: 'Play some sound',
      examples: [ 'sound [name]' ]
    })

    this.DB = new SQLite3.Database(path.join(__dirname, 'sounds.sqlite'))
    this.connection = null
  }

  async run (message, args) {
    args = args.toLowerCase()
    let command = args
    let param = undefined
    
    if(args.indexOf(' ') !== -1) {
      command = args.substr(0, args.indexOf(' '))
      param = args.substr(args.indexOf(' ') + 1)
    }

    switch (command) {
      case 'list': await this.listItems(message, param); break;
      default: await this.playSound(message, args); break;
    }
  }

  async listItems (message, category) {
    let sql
    if (category === undefined) {
      sql = 'SELECT * FROM Category'
    } else {
      sql = 'SELECT S.* FROM Sound As S, Category As C WHERE S.Category_Id == C.Id AND C.Name == \'' + category + '\''
    }

    this.DB.all(sql, async (err, rows) => {
      let output = 'Available ' + (category ? 'Sounds' : 'Categories') + ':\`\`\`'
      for(let i = 0; i < rows.length; i++) {
        if (category) {
          output += '\n- ' + rows[i].Key + ' (' + rows[i].Id + ')'
        } else {
          output += '\n- ' + rows[i].Name
        }
      }
      output += '\`\`\`'

      let dm = await message.author.createDM()
      dm.send(output)
    })
  }

  async playSound (message, args) {
    let self = this
    self.DB.all(`
      SELECT S.*, C.Name As Category_Name
      FROM
        Sound As S,
        Category As C
      WHERE
        S.Category_Id == C.Id AND
        (
          S.Key == \'${args}\' OR
          S.ID == \'${args}\'
        )
    `, async (err, rows) => {
      if (err || rows.length === 0) {
        message.channel.send(`Sound \"${args || 'undefined'}\" not found`)
        return
      }

      try {
        let sound = rows[0]
        let file = path.join(__dirname, 'files', sound.Category_Name, sound.Filename)
        let voiceChannel = message.member.voiceChannel
        let inChannel = await Helpers.inVoiceChannel(voiceChannel.members)

        if (!inChannel || self.connection === null) {
          if (self.connection) self.connection.disconnect()
          self.connection = await voiceChannel.join()
        }

        self.connection.playFile(file)

        console.log(file)
      } catch(error) {
        console.log('Error occured!')
        console.log(error)
      }
    })
  }
}

module.exports = SoundCommand