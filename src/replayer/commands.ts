import z from 'zod'

export const id = z.number().safe().finite().nonnegative()
export const nullableId = id.nullable()
export const nonEmptyString = z.string().min(1)
export const time = z.string().datetime()
export const number = z.number().safe().finite()
export const reason = nonEmptyString.max(512)

export const teamData = z.object({
  teamId: id,
  stickId: id,
  teamName: nonEmptyString,
})

const issuerCommand = z.object({ issuer: nonEmptyString })

export const setStartTimeCommand = issuerCommand
  .extend({
    type: z.literal('SET_START'),
    time: time,
  })
  .strict()
export type SetStartTimeCommand = z.infer<typeof setStartTimeCommand>

export const setEndTimeCommand = issuerCommand
  .extend({
    type: z.literal('SET_END'),
    time: time,
  })
  .strict()
export type SetEndTimeCommand = z.infer<typeof setEndTimeCommand>

export const setStickCommand = issuerCommand
  .extend({
    type: z.literal('SET_STICK'),
    teamId: id,
    stickId: nullableId,
  })
  .strict()
export type SetStickCommand = z.infer<typeof setStickCommand>

export const setDisqualificationCommand = issuerCommand
  .extend({
    type: z.literal('SET_DISQUALIFICATION'),
    teamId: id,
    disqualified: z.boolean(),
    reason: reason,
  })
  .strict()
export type SetDisqualificationCommand = z.infer<
  typeof setDisqualificationCommand
>

export const stickReadCommand = z
  .object({
    type: z.literal('STICK_READ'),
    stickId: id,
    stickBatteryPercentage: number,
    readerId: id,
    rssi: number,
    timestamp: time,
  })
  .strict()
export type StickReadCommand = z.infer<typeof stickReadCommand>

export const ignoreCommand = issuerCommand
  .extend({
    type: z.literal('IGNORE'),
    commandId: id,
  })
  .strict()
export type IgnoreCommand = z.infer<typeof ignoreCommand>

export const correctionCommand = issuerCommand
  .extend({
    type: z.literal('CORRECTION'),
    teamId: id,
    amount: number,
    reason: reason,
  })
  .strict()
export type CorrectionCommand = z.infer<typeof correctionCommand>

export const genesisCommand = z
  .object({
    type: z.literal('GENESIS'),
    teams: teamData.strict().array(),
  })
  .strict()
export type GenesisCommand = z.infer<typeof genesisCommand>

export const command = z.union([
  setStartTimeCommand,
  setEndTimeCommand,
  setStickCommand,
  setDisqualificationCommand,
  stickReadCommand,
  genesisCommand,
  ignoreCommand,
  correctionCommand,
])

export type Command = z.infer<typeof command>
export type CommandType = Command['type']
