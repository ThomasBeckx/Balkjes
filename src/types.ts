import { Balk } from "./balk"

export interface State {
  laps: number
  progress: number
}
  
export interface Team {
  id: number
  name: string
  balk: Balk
  state: State
  target: () => State
}

export interface Read {
  time: Date,
  stick: number,
  position: number
}
