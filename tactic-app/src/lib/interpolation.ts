import type { Keyframe, Vec2 } from '@/types'

export function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a)
}

export function lerpVec2(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }
}

export function getPositionAtTime(keyframes: Keyframe[], time: number): Vec2 {
  if (keyframes.length === 0) return { x: 0.5, y: 0.5 }

  const sorted = [...keyframes].sort((a, b) => a.time - b.time)

  if (time <= (sorted[0]?.time ?? 0)) {
    return sorted[0]?.position ?? { x: 0.5, y: 0.5 }
  }

  const last = sorted[sorted.length - 1]
  if (time >= (last?.time ?? 1)) {
    return last?.position ?? { x: 0.5, y: 0.5 }
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const kfA = sorted[i]
    const kfB = sorted[i + 1]
    if (!kfA || !kfB) continue
    if (time >= kfA.time && time <= kfB.time) {
      const t = (time - kfA.time) / (kfB.time - kfA.time)
      return lerpVec2(kfA.position, kfB.position, t)
    }
  }

  return { x: 0.5, y: 0.5 }
}
