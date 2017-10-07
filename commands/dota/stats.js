const path = require('path')

/*
 *
 *
 */

const Discord = require('discord.js')
const Commando = require('discord.js-commando')
const SQLite3 = require('sqlite3').verbose()
const Axios = require('axios')
const API = require('./api')
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
    this.LIMIT = 20
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
            let response = await Axios.all([
              API.Players.Data.queue(row.dota_id),
              API.Players.RecentMatches.queue(row.dota_id)
            ])
            let parser = (data, recentMatches) => {
              return {
                data: API.Players.Data.parse(data),
                recentMatches: API.Players.RecentMatches.parse(recentMatches)
              }
            }
            let data = parser.apply(null, response)
            let lastHitsProMin = data.recentMatches.Damage.last_hits / data.recentMatches.Stats.duration.getMinutes()
            let embed = new Discord.RichEmbed()
              .setAuthor(data.data.Account.name, data.data.Account.avatar.small)
              .setDescription('_The following are averages and percentages based on the last 20 parsed matches_')
              .setTimestamp()
              // General
              .addField(
                'General',
                `Winrate: ${data.recentMatches.Stats.wins}%
                 KDA: **${data.recentMatches.General.kills}**/**${data.recentMatches.General.deaths}**/**${data.recentMatches.General.assists}**
                 Game duration: ${data.recentMatches.Stats.duration_formatted().replace('00:', '')}
                 Ranked: ${data.recentMatches.Stats.ranked}%
                 Party: ${data.recentMatches.Stats.party}%
                `.replace(/^(\s)*/gm, ''),
                true
              )
              // MMR
              .addField(
                'MMR',
                `Solo: \`${data.data.MMR.solo}\`
                  Party: \`${data.data.MMR.party}\`
                  Estimated: \`${data.data.MMR.estimated}\`
                `.replace(/^(\s)*/gm, ''),
                true
              )
              // Economy
              //     Farm from Jungle: ${Math.round((stats.neutral_kills * 100 / stats.last_hits) * 100) / 100}%
              .addField(
                'Economy',
                `GPM: ${data.recentMatches.Economy.gpm}
                 XPM: ${data.recentMatches.Economy.xpm}
                 Last Hits/min: ${Math.round(lastHitsProMin * 100) / 100}
                `.replace(/^(\s)*/gm, ''),
                true
              )
              // Heroes
              .addField(
                'Heroes',
                `<:attr_strength:365158484511293441> ${data.recentMatches.Heroes.strength}%
                  <:attr_agility:365158657941569536> ${data.recentMatches.Heroes.agility}%
                  <:attr_intelligence:365158714379993098> ${data.recentMatches.Heroes.intelligence}%
                `.replace(/^(\s)*/gm, ''),
                true
              )
              // Laning
              .addField(
                'Laning',
                `Safe Lane: ${data.recentMatches.Role.safe}%
                  Mid Lane: ${data.recentMatches.Role.mid}%
                  Off Lane: ${data.recentMatches.Role.off}%
                  Jungle: ${data.recentMatches.Role.jungle}%
                  Roaming: ${data.recentMatches.Role.roaming}%
                `.replace(/^(\s)*/gm, ''),
                true
              )
              // Spacer
              .addBlankField(true)

            message.channel.send({embed})
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
