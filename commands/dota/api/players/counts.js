const { IAPI } = require('../')

class Counts extends IAPI {
  constructor () {
    super()
    this.limit = null
  }

  async get (accountId, limit) {
    let response = await this.queue(accountId, limit)

    return this.parse(response)
  }

  async queue (accountId, limit) {
    this.limit = limit
    return this.Axios.get(`players/${accountId}/counts?limit=${limit}`)
  }

  parse (response) {
    if (response.status === 200) {
      return response.data
    } else {
      throw new Error({
        message: 'Player counts not found',
        source: response.request.path
      })
    }
  }
}

exports.Counts = Counts
