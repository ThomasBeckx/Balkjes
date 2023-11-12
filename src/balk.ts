import { clampBetweenZeroAndOne, clamped, toId } from "./util"

export type Balk = {
  id: string
  root: HTMLElement
  setScore: (n: number) => void
  setProgress: (n: number) => void
}
  
const overviewDiv = document.querySelector<HTMLDivElement>('#balk-list')!

export const addBalk = (...balks: Balk[]) => {
  balks.forEach(b => overviewDiv.appendChild(b.root))
}

export const moveBalk = (moveBalk: Balk, index: number) => {
  index = clamped(index, 0, overviewDiv.children.length)
  const el = overviewDiv.children[index]
  if (moveBalk.root !== el) {
    overviewDiv.insertBefore(moveBalk.root, el)
  }
}

export const createBalk = (name: string): Balk => {
  const balkDiv = document.createElement('div')
  const progressDiv = document.createElement('div')
  const textDiv = document.createElement('div')

  const nameSpan = document.createElement('span')
  const countSpan = document.createElement('span')

  textDiv.append(nameSpan, countSpan)
  balkDiv.append(progressDiv, textDiv)

  balkDiv.className = 'balk'
  progressDiv.className ='progress'
  textDiv.className = 'text'

  
  const setScore = (n: number) => {
    countSpan.innerText = n.toString()
  }
  
  const setProgress = (n: number) => {
    const progress = clampBetweenZeroAndOne(n)
    progressDiv.style.width = (progress * balkDiv.getBoundingClientRect().width) + 'px'
  }
  
  nameSpan.innerText = name
  setScore(0)
  setProgress(0)

  return {
    id: toId(name),
    root: balkDiv,
    setScore,
    setProgress
  }
}
