import { clamped, lerp } from "./util"


interface InterpolatorParams {
  start: number
  readerDistance: number[]
  trackLength: number
}

const WEIGHT_FACTOR = 0.6

export const createInterpolator = ({start, readerDistance, trackLength}: InterpolatorParams) => {
  // Related to current simulation
  const lastReadMilliseconds: number[] = []
  // Related to time on the event
  const lastEventReadMilliseconds: number[] = []
  const lastEventReadPosition: number[] = []

  const speed: number[] = []

  const getDistance = (from: number, to: number): number => {
    // -1 to compensate for reader ids starting at 1 
    from = clamped(from-1, 0, readerDistance.length-1)
    to = clamped(to-1, 0, readerDistance.length-1)

    if (from < to) {
      return readerDistance[to] - readerDistance[from]
    } else if (from > to) {
      return (trackLength - readerDistance[from]) + readerDistance[to]
    } else {
      // This case is threated as a double read currently
      return 0
    }

  }

  const getInterpolatedDistance = (teamId: number): number => {
    const lastSeen = lastReadMilliseconds[teamId]
    const speedEstimate = speed[teamId]
    
    if (!lastSeen || !speedEstimate) {
      return 0
    }

    const time = new Date().getTime() - lastSeen
    const estimate = (time * speedEstimate) / trackLength
    return estimate
  }

  const recordRead = (teamId: number, read: {position: number, time: number}) => {
    const nowTime = new Date().getTime()

    if (read.time === lastEventReadMilliseconds[teamId]) {
      // No new read
      return
    }

    const distance = getDistance(lastEventReadPosition[teamId], read.position)
    const newSpeed = distance / (read.time - (lastEventReadMilliseconds[teamId] ?? start))
    speed[teamId] = lerp(speed[teamId] ?? 0, newSpeed, WEIGHT_FACTOR)

    lastReadMilliseconds[teamId] = nowTime
    lastEventReadMilliseconds[teamId] = read.time
    lastEventReadPosition[teamId] = read.position
  }

  return {
    recordRead,
    getInterpolatedDistance
  }
}
