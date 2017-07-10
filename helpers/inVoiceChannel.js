module.exports = (members) => {
  return new Promise((resolve, reject) => {
    members.forEach((member, snowflake) => {
      if (member.user.username === 'DotaBot') resolve(true)
    })
    resolve(false)
  })
}
