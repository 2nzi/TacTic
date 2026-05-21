import type { Player } from '@/types'

interface PlayerTokenProps {
  player: Player
  x: number
  y: number
  isSelected: boolean
  directionAngle: number | null
  onPointerDown: (e: React.PointerEvent<SVGGElement>) => void
}

function DirectionArrow({ angle, r, color }: { angle: number; r: number; color: string }) {
  const a = (angle * Math.PI) / 180
  const tipR = r + 2.2
  const baseR = r + 0.8
  const spread = 0.48

  const tip: [number, number] = [tipR * Math.cos(a), tipR * Math.sin(a)]
  const left: [number, number] = [baseR * Math.cos(a - spread), baseR * Math.sin(a - spread)]
  const right: [number, number] = [baseR * Math.cos(a + spread), baseR * Math.sin(a + spread)]

  return (
    <polygon
      points={`${tip[0]},${tip[1]} ${left[0]},${left[1]} ${right[0]},${right[1]}`}
      fill={color}
      opacity="0.82"
      style={{ pointerEvents: 'none' }}
    />
  )
}

export function PlayerToken({ player, x, y, isSelected, directionAngle, onPointerDown }: PlayerTokenProps) {
  const isOpp = player.team === 'B'
  const textColor = isOpp ? '#08172e' : '#1a0a02'
  const r = 2.6

  return (
    <g transform={`translate(${x},${y})`} onPointerDown={onPointerDown} style={{ cursor: 'grab' }}>
      {/* Selection rings */}
      {isSelected && (
        <>
          <circle r={r + 1.0} fill="none" stroke="#fff" strokeWidth="0.28" />
          <circle r={r + 1.9} fill="none" stroke="#fff" strokeWidth="0.1" opacity="0.3" />
        </>
      )}

      {/* Direction arrow (next keyframe) */}
      {directionAngle !== null && (
        <DirectionArrow angle={directionAngle} r={r} color={player.color} />
      )}

      {/* Token circle */}
      <circle r={r} fill={player.color} stroke={isOpp ? '#1d4fc0' : '#a23910'} strokeWidth="0.22" />

      {/* Label */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="JetBrains Mono, monospace"
        fontSize="2.2"
        fontWeight="700"
        fill={textColor}
        y="0.05"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {player.label}
      </text>
    </g>
  )
}
