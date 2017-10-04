const path = require('path')

/*
 *
 *
 */

const Commando = require('discord.js-commando')
const SQLite3 = require('sqlite3').verbose()
const Logger = require('../../logger')

class PatchnotesCommand extends Commando.Command {
  constructor (client) {
    super(client, {
      name: 'setsteam',
      memberName: 'setsteam',
      group: 'dota',
      description: 'Maps Discorduser to Steam Id (get Id from OpenDota or DotaBuff)',
      examples: [ 'setsteam [name] [dota_id]' ]
    })

    this.DB = new SQLite3.Database(path.join(__dirname, '..', 'db.sqlite'))
  }

  async run (message, args) {
    let server = message.guild
    let params = args.split(' ')
    if (server.available) {
      let needle = params[0].replace(/[<,>,!,@]/g, '')
      let user = server.members.get(needle)

      if (user) {
        user = user.user
      } else {
        user = message.author
        params.push(params[0])
      }

      this.DB.run('INSERT INTO DotaUsers (discord_id, discord_user, dota_id) VALUES ($discord_id, $discord_user, $dota_id)', {
        $discord_id: user.id,
        $discord_user: user.username,
        $dota_id: params[1]
      }, async (err) => {
        if (!err) {
          Logger.info(`User ${user.username} added!`, message)
        } else {
          if (err.message === 'SQLITE_CONSTRAINT: UNIQUE constraint failed: DotaUsers.discord_id, DotaUsers.dota_id') {
            Logger.error(`User ${user.username} (${user.id}) already exists!`, message)
          } else {
            Logger.error(err.message, message)
          }
        }
      })
    }
  }
}

module.exports = PatchnotesCommand
