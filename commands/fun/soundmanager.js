const path = require('path')
const stream = require('stream')

/*
 * Music Player
 *
 * https://github.com/Just-Some-Bots/MusicBot/tree/master/musicbot
 */
const FileCache = require('class-file-cache')
const SoundManager = {
  cache: new FileCache(path.join(__dirname, 'files')),
  voiceChannel: {
    name: null
  },
  voiceConnection: null,
  dispatcher: null,

  /**
   * Sets output voicechannel
   * @param {Discord VoiceChannel} voiceChannel
   */
  async setVoiceChannel (voiceChannel) {
    if (this.voiceChannel.name !== voiceChannel.name) {
      this.voiceConnection = await voiceChannel.join()
    }
    this.voiceChannel = voiceChannel
  },

  leave () {
    if (this.voiceChannel.name !== null) {
      this.voiceChannel.leave()
    }
  },

  /**
   * Play Soundfile
   * @param {*} category
   * @param {*} filename
   */
  play (category, filename) {
    let filepath = path.join(category, filename) + '.mp3'
    let file = this.cache.get(filepath)
    let data = new stream.PassThrough()

    data.end(file.buffer)

    this.dispatcher = this.voiceConnection.playStream(data)
    this.dispatcher.on('end', () => {
      this.dispatcher = null
    })
  },

  /**
   * Stop Soundfile
   */
  async stop () {
    if (this.dispatcher) this.dispatcher.end()
  }
}

module.exports = SoundManager
