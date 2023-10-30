import { isAfter, isBefore, parseISO } from "date-fns"
import { Read } from "../types"
import { Command, command } from "./commands"
import { delay } from "../util"


interface ReplayerParameters {
  fetchData: () => Promise<unknown>
}

export interface TeamScore {
  score: number
  lastReadPosition: number
  lastReadMilliseconds: number
}

export const createReplayer = async ({ fetchData }: ReplayerParameters) => {
  // Fetch data
  const data = await fetchData()
  const { startDate, teamData, readEvents, stickEvents} = await parseData(data)

  const startMilliseconds = new Date().getTime()
  const eventStartMilliseconds = startDate.getTime()

  // Data stream indexes
  let readIndex = 0
  let stickIndex = 0

  // Persistent data
  const sticks: number[] = []
  
  const scores: number[] = []
  const lastReadPosition: number[] = []
  const lastReadMilliseconds: number[] = []

  // Functions
  const getTeamScore = (teamId: number): TeamScore => ({
    score: scores[teamId],
    lastReadPosition: lastReadPosition[teamId],
    lastReadMilliseconds: lastReadMilliseconds[teamId],
  })

  const recalculateScore = () => {
    const millisecondsSinceStart = new Date().getTime() - startMilliseconds
    while (stickIndex < stickEvents.length && stickEvents[stickIndex].time.getTime() - eventStartMilliseconds < millisecondsSinceStart) {
      sticks[stickEvents[stickIndex].stick] = stickEvents[stickIndex].team
      stickIndex+=1
    }
  
    while (readIndex < readEvents.length && readEvents[readIndex].time.getTime() - eventStartMilliseconds < millisecondsSinceStart) {
      const event = readEvents[readIndex]
      const team = sticks[event.stick]
      if (team) {
        const diff = event.position - (lastReadPosition[team] ?? 0)
        const addition = diff > 0 ? diff : diff + 5

        // Save values
        scores[team] = (scores[sticks[event.stick]] ?? 0) + addition
        lastReadPosition[team] = event.position
        lastReadMilliseconds[team] = event.time.getTime()
      }
      readIndex += 1
    }
    const nextTime = readIndex < readEvents.length ? (readEvents[readIndex].time.getTime() - eventStartMilliseconds) - millisecondsSinceStart : 100_000
    delay(recalculateScore, nextTime-10)
  }

  // Logic

  // Assigns initial sticks
  teamData.forEach(team => sticks[team.stickId] = team.teamId)
  // Start score calculation
  recalculateScore()

  return {
    teamData,
    eventStart: startDate,
    getTeamScore
  }
}

const parseData = async (data: unknown) => {
  const commands = command.array().parse(data)

  let teamData: Extract<Command, { type: 'GENESIS' }>['teams'] = []
  let start = ''
  let end = ''

  let reads: Read[] = []
  let stickEvents: { time: Date, team: number, stick: number }[] = []

  for (const command of commands) {
    if (command.type === 'STICK_READ') {
      reads.push({time: parseISO(command.timestamp), stick: command.stickId, position: command.readerId })
    } else if (command.type === 'SET_STICK') {
      const time = reads.length > 0 ? reads[reads.length - 1].time : new Date(0)
      stickEvents.push({time, stick: command.stickId!, team: command.teamId})
    } else if (command.type === 'GENESIS') {
      teamData = command.teams
    } else if (command.type === 'SET_START') {
      start = command.time
    } else if (command.type === 'SET_END') {
      end = command.time
    }
  }

  const startDate = parseISO(start)
  const endDate = parseISO(end)

  const readEvents = reads.filter(p => isAfter(p.time, startDate) && isBefore(p.time, endDate))

  return {
    teamData,
    readEvents,
    stickEvents,
    startDate,
    endDate
  }
}
