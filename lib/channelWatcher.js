class ChannelWatcher {
  constructor(bot, guildId) {
    this.bot = bot
    this.users = this.getUsers(guildId)

    setInterval(() => this.watch(bot, guildId), 200)
  }

  getUsers(guildId) {
    const guild = this.bot.guilds.get(guildId)
    const users = {}

    guild.members.forEach(guildMember => {
      users[guildMember.id] = {
        guildMember,
        voice: {
          channel: guildMember.voiceChannel,
          id: guildMember.voiceChannelID
        }
      }
    })

    return users
  }

  watch(bot, guildId) {
    const users = this.getUsers(guildId)
    Object.keys(users).forEach(id => {
      const oldData = this.users[id]
      const newData = users[id]
      if (oldData.voice.id !== newData.voice.id) {
        bot.emit('guildMemberVoiceChannelChanged', {
          guildMember: oldData.guildMember,
          oldVoice: {
            channel: oldData.voice.channel,
            id: oldData.voice.id
          },
          newVoice: {
            channel: newData.voice.channel,
            id: newData.voice.id
          }
        })
      }
    })
    this.users = users
  }
}

module.exports = ChannelWatcher
