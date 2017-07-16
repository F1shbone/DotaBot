/*
 *
 *
 */

const Commando = require('discord.js-commando')
const Axios = require('axios')
const Helpers = require('../../helpers')

class StatsCommand extends Commando.Command {
  constructor (client) {
    super(client, {
      name: 'stats',
      memberName: 'stats',
      group: 'dota',
      description: 'Echo Player Dota stats',
      examples: [ 'stats' ]
    })
  }

  async run (message, args) {
    let user = await Helpers.snowflake2user(args, message.channel.members)
    let id = Helpers.discord2dota(user ? user.username : message.author.username)
    if (id !== null) {
      try {
        let stats = await Axios.get(`https://api.opendota.com/api/players/${id}`)
        let winlose = await Axios.get(`https://api.opendota.com/api/players/${id}/wl`)
        let mmr = {
          solo: stats.data.solo_competitive_rank,
          party: stats.data.competitive_rank,
          estimate: stats.data.mmr_estimate.estimate
        }
        let winrate = winlose.data.win * 100 / (winlose.data.win + winlose.data.lose)
        let msg = `MMR for player: **${stats.data.profile.personaname}**`

        msg += '```'
        msg += `\nSolo MMR:     ${mmr.solo || 'uncalibrated'}`
        msg += `\nParty MMR:    ${mmr.party || 'uncalibrated'}`
        msg += `\nEstimate MMR: ${mmr.estimate}`
        msg += `\nWinrate:      ${Math.round(winrate * 100) / 100}%`
        msg += '```'

        message.channel.send(msg)
      } catch (e) {
        console.error(e)
      }
    } else {
      message.channel.send(`No stats for User [${args || message.author}] found!`)
    }
  }
}

module.exports = StatsCommand
