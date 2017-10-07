const Axios = require('axios').create({
  baseURL: 'https://api.opendota.com/api/',
  timeout: 5000
})

class IAPI {
  constructor () {
    this.Axios = Axios
  }

  round (num, places) {
    let pow = Math.pow(10, places || 0)
    return Math.round(num * pow) / pow
  }
}

exports.IAPI = IAPI

const { Players } = require('./players.js')
module.exports = {
  Players: new Players(Axios)
}
