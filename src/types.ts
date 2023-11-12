import { Balk } from "./balk"

export type State = {
  laps: number
  progress: number
}
  
export type Team = {
  id: number
  name: string
  balk: Balk
  state: State
  target: () => State
}

export type Read = {
  time: Date,
  stick: number,
  position: number
}
