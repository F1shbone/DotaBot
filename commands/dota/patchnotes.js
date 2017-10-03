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
      if (args.indexOf('reddit') === -1) throw new Error()

      let response = await Axios.get(args)
      let $ = Cheerio.load(response.data)
      let author = $('#siteTable .author').text()
      let title = $('a.title').text()
      let size = $('#siteTable form .md').children().last().text()

      let server = message.guild
      let channel = server.channels.find(val => val.id === '360819006711529492')

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
    } catch (e) {
      Logger.error('Invalid link, please link to a reddit post', message)
    }
  }
}

module.exports = PatchnotesCommand
