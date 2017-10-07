const { IAPI } = require('../')

class Totals extends IAPI {
  async get (accountId, limit) {
    let response = await this.queue(accountId, limit)

    return this.parse(response)
  }

  async queue (accountId, limit) {
    return this.Axios.get(`players/${accountId}/totals?limit=${limit}`)
  }

  parse (response) {
    if (response.status === 200) {
      let data = response.data.reduce((result, item) => {
        result[item.field] = item.sum / item.n
        return result
      }, {})
      let date = new Date(null); date.setSeconds(data.duration)

      return {
        General: {
          kills: super.round(data.kills),
          deaths: super.round(data.deaths),
          assists: super.round(data.assists)
        },
        Economy: {
          gpm: super.round(data.gold_per_min, 2),
          xpm: super.round(data.xp_per_min, 2),
          last_hits: super.round(data.last_hits, 2),
          denies: super.round(data.denies, 2),
          jungle: super.round(data.neutral_kills * 100 / data.last_hits, 2)
        },
        Damage: {
          hero_damage: super.round(data.hero_damage),
          hero_healing: super.round(data.hero_healing),
          tower_damage: super.round(data.tower_damage)
        },
        Stats: {
          level: super.round(data.level),
          duration: date,
          duration_formatted: date.toISOString().substr(14, 5),
          stuns: super.round(data.stuns),
          tower_kills: super.round(data.tower_kills),
          neutral_kills: super.round(data.neutral_kills),
          courier_kills: super.round(data.courier_kills),
          actions_per_min: super.round(data.actions_per_min)
        }
      }
    } else {
      throw new Error({
        message: 'Player totals not found',
        source: response.request.path
      })
    }
  }
}

exports.Totals = Totals
