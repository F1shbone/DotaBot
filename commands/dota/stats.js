const path = require('path')

/*
 *
 *
 */

const Commando = require('discord.js-commando')
const SQLite3 = require('sqlite3').verbose()
const Axios = require('axios')
const Logger = require('../../logger')

class StatsCommand extends Commando.Command {
  constructor (client) {
    super(client, {
      name: 'stats',
      memberName: 'stats',
      group: 'dota',
      description: 'Echo Player Dota stats',
      examples: [ 'stats' ]
    })

    this.DB = new SQLite3.Database(path.join(__dirname, '..', 'db.sqlite'))
  }

  async run (message, args) {
    let server = message.guild
    if (server.available) {
      let needle = args.replace(/[<,>,!,@]/g, '')
      let user = server.members.get(needle)

      this.DB.get('SELECT dota_id FROM DotaUsers WHERE discord_id = $discord_id', {
        $discord_id: (user ? user.user : message.author).id
      }, async (err, row) => {
        if (!err && row) {
          try {
            let stats = await Axios.get(`https://api.opendota.com/api/players/${row.dota_id}`)
            let winlose = await Axios.get(`https://api.opendota.com/api/players/${row.dota_id}/wl`)
            let mmr = {
              solo: stats.data.solo_competitive_rank,
              party: stats.data.competitive_rank,
              estimate: stats.data.mmr_estimate.estimate
            }
            let winrate = winlose.data.win * 100 / (winlose.data.win + winlose.data.lose)

            message.channel.send({
              embed: {
                author: {
                  name: stats.data.profile.personaname,
                  icon_url: stats.data.profile.avatar
                },
                timestamp: new Date(),
                fields: [
                  {
                    name: 'Solo MMR',
                    value: `\`${mmr.solo || 'uncalibrated'}\``,
                    inline: true
                  },
                  {
                    name: 'Party MMR',
                    value: `\`${mmr.party || 'uncalibrated'}\``,
                    inline: true
                  },
                  {
                    name: 'Estimate MMR',
                    value: `\`${mmr.estimate}\``,
                    inline: true
                  },
                  {
                    name: 'Winrate',
                    value: `\`${Math.round(winrate * 100) / 100}%\``
                  }
                ]
              }
            })
          } catch (e) {
            console.error(e)
          }
        } else {
          if (!err) {
            user = user ? user.user : message.author
            Logger.error(`User ${user.username} not found! You can add this user via \`\`\`!setsteam ${user.username}#${user.discriminator} [DotaID]\`\`\``, message)
          } else {
            Logger.error(err.message, message)
          }
        }
      })
    }
  }
}

module.exports = StatsCommand
