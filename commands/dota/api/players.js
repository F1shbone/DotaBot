const { Data } = require('./players/data.js')
const { RecentMatches } = require('./players/recentMatches.js')
const { Totals } = require('./players/totals.js')
const { Counts } = require('./players/counts.js')

class Players {
  constructor () {
    this.Data = new Data()
    this.RecentMatches = new RecentMatches()
    this.Totals = new Totals()
    this.Counts = new Counts()
  }
}

exports.Players = Players
