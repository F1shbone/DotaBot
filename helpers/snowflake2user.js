module.exports = (needle, users) => {
  return new Promise((resolve, reject) => {
    needle = needle.substr(2).replace('>', '')
    users.forEach((user, snowflake) => {
      if (snowflake === needle) {
        resolve(user.user)
      }
    })
    resolve(null)
  })
}
