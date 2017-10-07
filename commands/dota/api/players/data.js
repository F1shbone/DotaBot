const { IAPI } = require('../')

class Data extends IAPI {
  async get (accountId) {
    let response = await this.queue(accountId)

    return this.parse(response)
  }

  async queue (accountId) {
    return this.Axios.get(`players/${accountId}`)
  }

  parse (response) {
    if (response.status === 200) {
      let data = response.data
      return {
        MMR: {
          solo: data.competitive_rank || 'uncalibrated',
          party: data.solo_competitive_rank || 'uncalibrated',
          estimated: data.mmr_estimate.estimate
        },
        Account: {
          id: data.profile.account_id,
          steamid: data.profile.steamid,
          name: data.profile.personaname,
          url: data.profile.profileurl,
          avatar: {
            small: data.profile.avatar,
            medium: data.profile.avatarmedium,
            large: data.profile.avatarfull
          }
        }
      }
    } else {
      throw new Error({
        message: 'Player data not found',
        source: response.request.path
      })
    }
  }
}

exports.Data = Data
