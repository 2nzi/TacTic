import { useRef, useCallback } from 'react'
import { usePatternStore } from '@/stores/patternStore'
import { getPositionAtTime } from '@/lib/interpolation'
import { PitchMarkings } from './PitchMarkings'
import { Trajectory } from './Trajectory'
import { PlayerToken } from './PlayerToken'

export const VW = 68
export const VH = 60

function svgCoords(svg: SVGSVGElement, clientX: number, clientY: number): { nx: number; ny: number } {
  const p = svg.createSVGPoint()
  p.x = clientX
  p.y = clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return { nx: 0.5, ny: 0.5 }
  const local = p.matrixTransform(ctm.inverse())
  return {
    nx: Math.max(0.01, Math.min(0.99, local.x / VW)),
    ny: Math.max(0.01, Math.min(0.99, local.y / VH)),
  }
}

function getDirectionAngle(keyframes: { time: number; position: { x: number; y: number } }[], currentTime: number, currentNx: number, currentNy: number): number | null {
  const sorted = [...keyframes].sort((a, b) => a.time - b.time)
  const next = sorted.find((k) => k.time > currentTime + 0.015)
  if (!next) return null
  const dx = (next.position.x - currentNx) * VW
  const dy = (next.position.y - currentNy) * VH
  if (Math.hypot(dx, dy) < 0.3) return null
  return (Math.atan2(dy, dx) * 180) / Math.PI
}

interface PitchSVGProps {
  readonly?: boolean
}

export function PitchSVG({ readonly = false }: PitchSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const draggingId = useRef<string | null>(null)

  const pattern = usePatternStore((s) => s.activePattern())
  const currentTime = usePatternStore((s) => s.currentTime)
  const selectedPlayerId = usePatternStore((s) => s.selectedPlayerId)
  const isPlaying = usePatternStore((s) => s.isPlaying)
  const selectPlayer = usePatternStore((s) => s.selectPlayer)
  const movePlayer = usePatternStore((s) => s.movePlayer)

  const onPlayerDown = useCallback(
    (e: React.PointerEvent<SVGGElement>, playerId: string) => {
      e.stopPropagation()
      selectPlayer(playerId)
      if (isPlaying || readonly) return
      draggingId.current = playerId
      ;(e.currentTarget as SVGGElement).setPointerCapture(e.pointerId)
    },
    [selectPlayer, isPlaying, readonly],
  )

  const onSvgMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!draggingId.current || !svgRef.current || readonly) return
      const { nx, ny } = svgCoords(svgRef.current, e.clientX, e.clientY)
      movePlayer(draggingId.current, { x: nx, y: ny })
    },
    [movePlayer, readonly],
  )

  const onSvgUp = useCallback(() => { draggingId.current = null }, [])

  if (!pattern) return null

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 68 60"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block rounded-xl"
      style={{ background: '#0e3a2a', touchAction: 'none', userSelect: 'none' }}
      onPointerMove={onSvgMove}
      onPointerUp={onSvgUp}
      onPointerLeave={onSvgUp}
    >
      <PitchMarkings />

      {/* Trajectories */}
      {pattern.players.map((p) => (
        <Trajectory
          key={`traj-${p.id}`}
          player={p}
          pauseTime={pattern.pauseTime}
          isSelected={p.id === selectedPlayerId}
        />
      ))}

      {/* Players */}
      {pattern.players.map((p) => {
        const pos = getPositionAtTime(p.keyframes, currentTime)
        const angle = getDirectionAngle(p.keyframes, currentTime, pos.x, pos.y)
        return (
          <PlayerToken
            key={p.id}
            player={p}
            x={pos.x * VW}
            y={pos.y * VH}
            isSelected={p.id === selectedPlayerId}
            directionAngle={angle}
            onPointerDown={(e) => onPlayerDown(e, p.id)}
          />
        )
      })}

      {/* Attack direction */}
      <text
        x="34"
        y="3"
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="1.9"
        fill="rgba(255,255,255,0.35)"
        letterSpacing="0.12"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        ATTAQUE ↑
      </text>
    </svg>
  )
}
