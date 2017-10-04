module.exports = (text, msg) => {
  msg.channel.send({
    embed: {
      timestamp: new Date(),
      fields: [
        {
          name: ':information_source: Info',
          value: text
        }
      ]
    }
  })
}
