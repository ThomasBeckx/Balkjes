

export type LoopFunction = (deltaTime: number) => void
export const loop = (func: LoopFunction) => {
  let prevTime = 0

  const loop = (time: number) => {
    const deltaTime = time - prevTime

    func(deltaTime)

    prevTime = time
    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)
}
