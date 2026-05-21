import type { Player } from '@/types'
import { getPositionAtTime } from '@/lib/interpolation'

const VW = 68
const VH = 60

function toSvg(x: number, y: number): [number, number] {
  return [x * VW, y * VH]
}

function buildPath(pts: [number, number][]): string {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0]![0]} ${pts[0]![1]}`
  let d = `M ${pts[0]![0]} ${pts[0]![1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1]!
    const [x2, y2] = pts[i]!
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    d += ` Q ${x1} ${y1} ${mx} ${my}`
    if (i === pts.length - 1) d += ` T ${x2} ${y2}`
  }
  return d
}

interface TrajectoryProps {
  player: Player
  pauseTime: number
  isSelected: boolean
  /** In player mode, only show pre-pause trajectory (no post-pause spoiler) */
  playerMode?: boolean
}

export function Trajectory({ player, pauseTime, isSelected, playerMode = false }: TrajectoryProps) {
  const sorted = [...player.keyframes].sort((a, b) => a.time - b.time)

  const prePts: [number, number][] = []
  const postPts: [number, number][] = []

  for (const kf of sorted) {
    const [x, y] = toSvg(kf.position.x, kf.position.y)
    if (kf.time <= pauseTime + 0.001) prePts.push([x, y])
    if (kf.time >= pauseTime - 0.001) postPts.push([x, y])
  }

  const hasPauseKf = sorted.some((k) => Math.abs(k.time - pauseTime) < 0.05)
  if (!hasPauseKf) {
    const p = getPositionAtTime(player.keyframes, pauseTime)
    const pt = toSvg(p.x, p.y)
    prePts.push(pt)
    postPts.unshift(pt)
  }

  const swPre = isSelected ? 0.7 : 0.35
  const swPost = isSelected ? 0.7 : 0.3
  const opPre = isSelected ? 0.9 : 0.2
  const opPost = isSelected ? 0.85 : 0.15
  const preColor = isSelected ? '#06b6d4' : player.color
  const PAUSE_COLOR = '#fbbf24'

  return (
    <g style={{ pointerEvents: 'none' }}>
      {prePts.length >= 2 && (
        <path
          d={buildPath(prePts)}
          fill="none"
          stroke={preColor}
          strokeWidth={swPre}
          strokeDasharray="0.9 0.8"
          strokeLinecap="round"
          opacity={opPre}
        />
      )}
      {!playerMode && postPts.length >= 2 && (
        <path
          d={buildPath(postPts)}
          fill="none"
          stroke={PAUSE_COLOR}
          strokeWidth={swPost}
          strokeDasharray="0.7 0.7"
          strokeLinecap="round"
          opacity={opPost}
        />
      )}

      {/* Ghost keyframe markers for selected player */}
      {isSelected &&
        sorted.map((kf, i) => {
          const [x, y] = toSvg(kf.position.x, kf.position.y)
          const isPause = Math.abs(kf.time - pauseTime) < 0.05
          const isPost = kf.time > pauseTime + 0.05
          const color = isPause || isPost ? PAUSE_COLOR : '#06b6d4'
          return (
            <g key={kf.id} opacity={isPause ? 0.95 : 0.55}>
              <circle cx={x} cy={y} r={isPause ? 1.8 : 1.4} fill="none" stroke={color} strokeWidth={0.2} />
              <text
                x={x}
                y={y + 0.65}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize="1.5"
                fill={color}
                opacity="0.85"
              >
                {i + 1}
              </text>
            </g>
          )
        })}
    </g>
  )
}
