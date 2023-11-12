import { lerp } from "./util"


type ExtrapolatorParams = {
  start: number
  getDistance: (from: number, to: number) => number
}

const WEIGHT_FACTOR = 0.6

export const createExtrapolator = ({start, getDistance}: ExtrapolatorParams) => {
  // Related to current simulation
  const lastReadMilliseconds: number[] = []
  // Related to time on the event
  const lastEventReadMilliseconds: number[] = []
  const lastEventReadPosition: number[] = []

  const speed: number[] = []

  const getExtrapolatedDistance = (teamId: number): number => {
    const lastSeen = lastReadMilliseconds[teamId]
    const speedEstimate = speed[teamId]
    
    if (!lastSeen || !speedEstimate) {
      return 0
    }

    const time = new Date().getTime() - lastSeen
    const estimate = time * speedEstimate
    return estimate
  }

  const recordRead = (teamId: number, read: {position: number, time: number}) => {
    const nowTime = new Date().getTime()

    if (read.time === lastEventReadMilliseconds[teamId]) {
      // No new read
      return
    }

    // Adjust for reader indexes starting at 1
    const distance = getDistance(lastEventReadPosition[teamId]-1, read.position-1)
    const newSpeed = distance / (read.time - (lastEventReadMilliseconds[teamId] ?? start))
    speed[teamId] = lerp(speed[teamId] ?? 0, newSpeed, WEIGHT_FACTOR)

    lastReadMilliseconds[teamId] = nowTime
    lastEventReadMilliseconds[teamId] = read.time
    lastEventReadPosition[teamId] = read.position
  }

  return {
    recordRead,
    getExtrapolatedDistance
  }
}
