const path = require('path')
const stream = require('stream')

/*
 * Music Player
 *
 */
const FileCache = require('class-file-cache')
const SoundManager = {
  cache: new FileCache(path.join(__dirname, 'files')),
  voiceChannel: {
    name: null
  },
  dispatcher: null,

  /**
   * Sets output voicechannel
   * @param {Discord VoiceChannel} voiceChannel
   */
  async setVoiceChannel (voiceChannel) {
    if (this.voiceChannel.name !== voiceChannel.name) {
      await voiceChannel.join()
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
    let connection = this.voiceChannel.connection

    data.end(file.buffer)

    this.dispatcher = connection.playStream(data)
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
