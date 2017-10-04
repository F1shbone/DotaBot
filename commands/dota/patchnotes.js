/*
 *
 *
 */

const Commando = require('discord.js-commando')
const Axios = require('axios')
const Cheerio = require('cheerio')
const Logger = require('../../logger')

class PatchnotesCommand extends Commando.Command {
  constructor (client) {
    super(client, {
      name: 'patchnotes',
      memberName: 'patchnotes',
      group: 'dota',
      description: 'Posts Patchnotes Link in Dotachat',
      examples: [ 'patchnotes [URL]' ]
    })
  }

  async run (message, args) {
    message.delete()

    try {
      let server = message.guild
      if (args.indexOf('reddit') === -1) throw new Error()
      if (server.available) {
        let response = await Axios.get(args)
        let $ = Cheerio.load(response.data)
        // Fields
        // let author = $('#siteTable .author').text() // Currently unused
        let title = $('a.title').text()
        let size = $('#siteTable form .md').children().last().text()

        let channel = server.channels.get('360819006711529492')

        channel.send({
          embed: {
            color: 0xe03724,
            title: title,
            url: args,
            footer: {
              text: size
            },
            timestamp: new Date()
          }
        })
      }
    } catch (e) {
      Logger.error('Invalid link, please link to a reddit post', message)
    }
  }
}

module.exports = PatchnotesCommand
