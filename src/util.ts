import { Team } from "./types"

export const clamped = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
export const clampBetweenZeroAndOne = (n: number) => clamped(n, 0, 1)

export const lerp = (from: number, to: number, scale: number): number => {
  scale = clampBetweenZeroAndOne(scale)
  return scale * to + (1 - scale) * from 
}

export const clampedLerp = (from: number, to: number, scale: number, interval: number): number => {
  const result = lerp(from, to, scale)
  if (Math.abs(result - to) < interval) {
    return to
  }
  return result
}

export const toId = (s: string) => s.toUpperCase().replace(/ /g,"_")
export const delay = (func: () => void, ms: number) => setTimeout(func, ms)

export const teamSort = (teamA: Team, teamB: Team) => {
  if (teamA.state.laps !== teamB.state.laps) {
    return teamA.state.laps - teamB.state.laps
  }
  if (teamA.state.progress !== teamB.state.progress) {
    return teamA.state.progress - teamB.state.progress
  }

  return teamB.name.toUpperCase().localeCompare(teamA.name.toUpperCase())
}
