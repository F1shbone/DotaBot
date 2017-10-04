module.exports = (text, msg) => {
  msg.channel.send({
    embed: {
      timestamp: new Date(),
      fields: [
        {
          name: ':x: Error',
          value: text
        }
      ]
    }
  })
}
