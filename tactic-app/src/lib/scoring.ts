import type { Vec2 } from '@/types'
import { getPositionAtTime } from './interpolation'
import type { Keyframe } from '@/types'

function pointToSegmentDistance(p: Vec2, a: Vec2, b: Vec2): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

export function scoreDrawingAgainstPath(
  drawing: Vec2[],
  keyframes: Keyframe[],
  sampleCount = 50,
  maxDistance = 0.15,
): number {
  if (drawing.length < 2) return 0

  let totalScore = 0

  for (let i = 0; i < sampleCount; i++) {
    const t = i / (sampleCount - 1)
    const ideal = getPositionAtTime(keyframes, t)

    let minDist = Infinity
    for (let j = 0; j < drawing.length - 1; j++) {
      const a = drawing[j]
      const b = drawing[j + 1]
      if (!a || !b) continue
      const d = pointToSegmentDistance(ideal, a, b)
      if (d < minDist) minDist = d
    }

    totalScore += Math.max(0, 1 - minDist / maxDistance)
  }

  return totalScore / sampleCount
}
