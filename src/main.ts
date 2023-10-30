import './style.css'

import { Balk, addBalk, createBalk, moveBalk } from './balk'
import { loop } from './loop'
import { State, Team } from './types'
import { clampedLerp, teamSort } from './util'
import { createInterpolator } from './interpolate'
import { createReplayer } from './replayer/replayer'


const getTargetScore = (team: number, total: number): State => {
  const passed = fetchedTeamScores[team] ?? 0
  const recordedProgress = ((passed % total) / total)

  // Never fill the bar entirely with interpolation 
  const estimatedDistance = Math.min((1 - recordedProgress) - 0.01, getInterpolatedDistance(team))

  return ({
    laps: Math.floor(passed / total),
    progress: recordedProgress + estimatedDistance
  })
}

const renderBalk = (balk: Balk, current: State, target: State) => {
  // Intermediate progress to fill up balk before going to 0
  let intermediateProgress = current.progress

  if (target.progress >= current.progress) {
    intermediateProgress = target.progress
  }

  if (current.laps != target.laps && current.progress !== 1) {
    intermediateProgress = 1
  }

  if (current.progress === 1) {
    current.progress = 0
    // Update score
    current.laps = target.laps
    balk.setScore(current.laps)
  } else {
    current.progress = clampedLerp(current.progress, intermediateProgress, 0.1, 0.005)
  }

  balk.setProgress(current.progress)
}

// ------------------
// ----- Logic ------
// ------------------

// Create replayer
const { teamData, eventStart, getTeamScore } = await createReplayer({
  fetchData: async () => (await (await fetch('/stream.json')).json())
})

// Create teams
const teams: Team[] = teamData.map(t => {
  return ({
  id: t.teamId,
  name: t.teamName,
  state: {laps: 0, progress: 0},
  target: () => getTargetScore(t.teamId, 5),
  balk: createBalk(t.teamName)
})})
const fetchedTeamScores: number[] = []

// Create visual elements for each team
addBalk(...teams.map(t => t.balk))

// Create interpolator
const eventStartMilliseconds = eventStart.getTime()

const { recordRead, getInterpolatedDistance } = createInterpolator({
  start: eventStartMilliseconds,
  readerDistance: [0, 142.60, 213.55, 312.05, 418.87],
  trackLength: 515
})

setInterval(() => {
  teams.forEach(team => {
    const score = getTeamScore(team.id)
    recordRead(team.id, { position: score.lastReadPosition, time: score.lastReadMilliseconds })
    fetchedTeamScores[team.id] = score.score
  })
}, 5000)

// Start render loop
loop(() => {


  // Update balk progress
  teams.forEach(t => renderBalk(t.balk, t.state, t.target()))

  // Move balk order if changed
  teams.sort(teamSort)
  teams.forEach((t, i, l) => moveBalk(t.balk, (l.length-1) - i))

})
