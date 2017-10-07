const { IAPI } = require('../')

const STR = [2, 7, 14, 16, 18, 19, 23, 28, 29, 38, 42, 49, 51, 54, 57, 59, 60, 69, 71, 73, 77, 78, 81, 83, 85, 91, 96, 97, 98, 99, 100, 102, 103, 104, 107, 108, 110]
const AGI = [1, 4, 6, 8, 9, 10, 11, 12, 15, 20, 32, 35, 40, 41, 44, 46, 47, 48, 56, 61, 62, 63, 67, 70, 72, 80, 82, 88, 89, 93, 94, 95, 106, 109, 113, 114]
const INT = [3, 5, 13, 17, 21, 22, 25, 26, 27, 30, 31, 33, 34, 36, 37, 39, 43, 45, 50, 52, 53, 55, 58, 64, 65, 66, 68, 74, 75, 76, 79, 84, 86, 87, 90, 92, 101, 105, 111, 112]

class RecentMatches extends IAPI {
  async get (accountId) {
    let response = await this.queue(accountId)

    return this.parse(response)
  }

  async queue (accountId) {
    return this.Axios.get(`players/${accountId}/recentMatches`)
  }

  parse (response) {
    if (response.status === 200) {
      let average = response.data.length
      let template = {
        General: {
          kills: 0,
          deaths: 0,
          assists: 0
        },
        Economy: {
          xpm: 0,
          gpm: 0
        },
        Damage: {
          hero_damage: 0,
          hero_healing: 0,
          tower_damage: 0,
          last_hits: 0
        },
        Stats: {
          wins: 0,
          duration: new Date(null),
          duration_formatted () { return this.duration.toISOString().substr(11, 8) },
          ranked: 0,
          party: 0
        },
        Lane: {
          safe: 0,
          mid: 0,
          off: 0,
          jungle: 0
        },
        Role: {
          safe: 0,
          mid: 0,
          off: 0,
          jungle: 0,
          roaming: 0
        },
        Heroes: {
          strength: 0,
          agility: 0,
          intelligence: 0
        }
      }
      let data = response.data.reduce((result, item) => {
        result.General.kills += item.kills
        result.General.deaths += item.deaths
        result.General.assists += item.assists

        result.Economy.xpm += item.xp_per_min
        result.Economy.gpm += item.gold_per_min

        result.Damage.hero_damage += item.hero_damage
        result.Damage.hero_healing += item.hero_healing
        result.Damage.tower_damage += item.tower_damage
        result.Damage.last_hits += item.last_hits

        let bin = ('00000000' + item.player_slot.toString(2)).substr(-8)
        result.Stats.wins += bin[0] === '0' ^ item.radiant_win ? 0 : 1
        result.Stats.duration.setTime(result.Stats.duration.getTime() + item.duration * 1000)
        result.Stats.ranked += (item.lobby_type === 7) ? 1 : 0
        result.Stats.party += (item.party_size) ? 1 : 0

        result.Lane.safe += (item.lane === 1) ? 1 : 0
        result.Lane.mid += (item.lane === 2) ? 1 : 0
        result.Lane.off += (item.lane === 3) ? 1 : 0
        result.Lane.jungle += (item.lane === 4) ? 1 : 0

        result.Role.safe += (item.lane_role === 1) ? 1 : 0
        result.Role.mid += (item.lane_role === 2) ? 1 : 0
        result.Role.off += (item.lane_role === 3) ? 1 : 0
        result.Role.jungle += (item.lane_role === 4) ? 1 : 0
        result.Role.roaming += (item.is_roaming) ? 1 : 0

        result.Heroes.strength += (STR.indexOf(item.hero_id)) !== -1 ? 1 : 0
        result.Heroes.agility += (AGI.indexOf(item.hero_id)) !== -1 ? 1 : 0
        result.Heroes.intelligence += (INT.indexOf(item.hero_id)) !== -1 ? 1 : 0

        return result
      }, template)

      // General
      Object.keys(data.General).map((key, index) => {
        data.General[key] = super.round(data.General[key] / average)
      })
      // Economy
      Object.keys(data.Economy).map((key, index) => {
        data.Economy[key] = super.round(data.Economy[key] / average, 2)
      })
      // Damage
      Object.keys(data.Damage).map((key, index) => {
        data.Damage[key] = super.round(data.Damage[key] / average, 2)
      })
      // Stats
      data.Stats.wins = super.round(data.Stats.wins * 100 / average, 2)
      data.Stats.duration.setTime(data.Stats.duration.getTime() / average)
      data.Stats.ranked = super.round(data.Stats.ranked * 100 / average, 2)
      data.Stats.party = super.round(data.Stats.party * 100 / average, 2)
      // Lane
      Object.keys(data.Lane).map((key, index) => {
        data.Lane[key] = super.round(data.Lane[key] * 100 / average, 2)
      })
      // Role
      Object.keys(data.Role).map((key, index) => {
        data.Role[key] = super.round(data.Role[key] * 100 / average, 2)
      })
      // Heroes
      Object.keys(data.Heroes).map((key, index) => {
        data.Heroes[key] = super.round(data.Heroes[key] * 100 / average, 2)
      })

      return data
    } else {
      throw new Error({
        message: 'Player recent matches not found',
        source: response.request.path
      })
    }
  }
}

exports.RecentMatches = RecentMatches
