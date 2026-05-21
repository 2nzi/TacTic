import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import { usePatternStore } from '@/stores/patternStore'
import { getPositionAtTime } from '@/lib/interpolation'
import { scoreDrawingAgainstPath } from '@/lib/scoring'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { usePointerDraw } from '@/hooks/usePointerDraw'
import { PitchMarkings } from '@/features/coach/components/PitchMarkings'
import { PlayerToken } from '@/features/coach/components/PlayerToken'
import { Trajectory } from '@/features/coach/components/Trajectory'
import type { Player } from '@/types'

const VW = 68
const VH = 60

type Phase = 'watching' | 'drawing' | 'result'

function drawUserPath(canvas: HTMLCanvasElement, points: { x: number; y: number }[], color: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx || points.length < 2) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(points[0]!.x * canvas.width, points[0]!.y * canvas.height)
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i]!.x * canvas.width, points[i]!.y * canvas.height)
  }
  ctx.stroke()
}

function ScoreDisplay({ score, onRetry, onDone }: { score: number; onRetry: () => void; onDone: () => void }) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? '#22c55e' : pct >= 50 ? '#fbbf24' : '#ef4444'
  const label = pct >= 80 ? 'Excellent !' : pct >= 50 ? 'Pas mal !' : 'Réessaie !'

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-30"
      style={{ background: 'rgba(6,8,12,0.85)', backdropFilter: 'blur(8px)', borderRadius: '12px' }}>
      <div className="text-center">
        <div className="text-5xl font-bold mb-1" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>
          {pct}%
        </div>
        <div className="text-lg font-semibold">{label}</div>
        <div className="text-sm mt-1" style={{ color: '#8b96a8' }}>Score de proximité</div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: '#181f2c', border: '1px solid #2c3647', color: '#e8ecef' }}
        >
          Réessayer
        </button>
        <button
          onClick={onDone}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: color + '22', border: `1px solid ${color}`, color }}
        >
          Valider
        </button>
      </div>
    </div>
  )
}

export function PlayerSession() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const loadPatterns = usePatternStore((s) => s.loadPatterns)
  const setActivePattern = usePatternStore((s) => s.setActivePattern)
  const pattern = usePatternStore((s) => s.activePattern())

  useEffect(() => {
    loadPatterns()
    if (id) setActivePattern(id)
  }, [id, loadPatterns, setActivePattern])

  const svgRef = useRef<SVGSVGElement>(null)
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)

  const [phase, setPhase] = useState<Phase>('watching')
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [score, setScore] = useState(0)

  const { points, clear: clearDrawing } = usePointerDraw(drawCanvasRef)

  // Pick a player (first team A player if none selected)
  useEffect(() => {
    if (pattern && !selectedPlayer) {
      setSelectedPlayer(pattern.players.find((p) => p.team === 'A') ?? null)
    }
  }, [pattern, selectedPlayer])

  const duration = pattern?.duration ?? 6000
  const pauseTime = pattern?.pauseTime ?? 0.5

  // Animation loop for watching phase
  const handleTick = useCallback(
    (elapsed: number) => {
      const t = elapsed / duration
      if (t >= pauseTime) {
        setCurrentTime(pauseTime)
        loop.stop()
        setPhase('drawing')
        return
      }
      setCurrentTime(t)
    },
    [duration, pauseTime],
  )
  const loop = useAnimationLoop(handleTick)

  const startWatching = () => {
    setPhase('watching')
    setCurrentTime(0)
    clearDrawing()
    loop.start(0)
  }

  useEffect(() => {
    if (phase === 'watching') loop.start(0)
    return () => loop.stop()
  }, []) // only on mount

  // Draw user path on canvas
  useEffect(() => {
    if (drawCanvasRef.current && points.length > 1) {
      drawUserPath(drawCanvasRef.current, points, '#fbbf24')
    } else if (drawCanvasRef.current) {
      const ctx = drawCanvasRef.current.getContext('2d')
      ctx?.clearRect(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height)
    }
  }, [points])

  const submitDrawing = () => {
    if (!selectedPlayer || points.length < 3) return
    const postPauseKfs = selectedPlayer.keyframes.filter((k) => k.time >= pauseTime)
    if (postPauseKfs.length < 2) { setScore(0); setPhase('result'); return }
    const s = scoreDrawingAgainstPath(points, postPauseKfs)
    setScore(s)
    setPhase('result')
  }

  const reset = () => {
    clearDrawing()
    setPhase('watching')
    startWatching()
  }

  if (!pattern) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: '#5a6478' }}>
        Chargement...
      </div>
    )
  }

  const isDrawing = phase === 'drawing'
  const isResult = phase === 'result'

  return (
    <div className="flex flex-col h-full" style={{ background: '#0a0e14' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid #1f2735' }}>
        <button
          onClick={() => navigate('/player')}
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: '#181f2c', border: '1px solid #1f2735' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate">{pattern.name}</div>
          <div className="font-mono text-[10px]" style={{ color: '#5a6478' }}>
            {phase === 'watching' ? '▶ Animation...' : phase === 'drawing' ? '✏ Dessine la trajectoire' : '★ Résultat'}
          </div>
        </div>

        {/* Player selector */}
        {pattern.players.filter((p) => p.team === 'A').length > 1 && (
          <div className="flex gap-1">
            {pattern.players.filter((p) => p.team === 'A').map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedPlayer(p); clearDrawing() }}
                className="w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-[10px] transition-all"
                style={{
                  backgroundColor: p.color,
                  color: '#1a0a02',
                  border: selectedPlayer?.id === p.id ? '2px solid #fff' : '2px solid transparent',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pitch + drawing area */}
      <div className="flex-1 min-h-0 relative p-3">
        <div className="relative w-full h-full">
          {/* Pitch SVG */}
          <svg
            ref={svgRef}
            viewBox="0 0 68 60"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full block rounded-xl"
            style={{ background: '#0e3a2a', userSelect: 'none' }}
          >
            <PitchMarkings />

            {/* Pre-pause trajectories for all players (not post-pause) */}
            {pattern.players.map((p) => (
              <Trajectory
                key={p.id}
                player={p}
                pauseTime={pauseTime}
                isSelected={p.id === selectedPlayer?.id}
                playerMode
              />
            ))}

            {/* Players at current time */}
            {pattern.players.map((p) => {
              const pos = getPositionAtTime(p.keyframes, currentTime)
              return (
                <PlayerToken
                  key={p.id}
                  player={p}
                  x={pos.x * VW}
                  y={pos.y * VH}
                  isSelected={p.id === selectedPlayer?.id}
                  directionAngle={null}
                  onPointerDown={() => {}}
                />
              )
            })}

            {/* Pause indicator */}
            {isDrawing && (
              <text
                x="34" y="57"
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize="2.2"
                fill="#fbbf24"
                opacity="0.8"
                style={{ pointerEvents: 'none' }}
              >
                ⏸ PAUSE — Dessine la suite
              </text>
            )}
          </svg>

          {/* Drawing canvas overlay */}
          {isDrawing && (
            <canvas
              ref={drawCanvasRef}
              className="absolute inset-0 w-full h-full rounded-xl"
              style={{ touchAction: 'none', cursor: 'crosshair', background: 'transparent' }}
              width={600}
              height={530}
            />
          )}

          {/* Score overlay */}
          {isResult && (
            <ScoreDisplay score={score} onRetry={reset} onDone={() => navigate('/player')} />
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="shrink-0 px-4 pb-4 flex items-center gap-3">
        {phase === 'watching' && (
          <div className="flex-1 text-center text-sm" style={{ color: '#8b96a8' }}>
            Regarde la situation...
          </div>
        )}

        {phase === 'drawing' && (
          <>
            <button
              onClick={clearDrawing}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: '#181f2c', border: '1px solid #2c3647', color: '#8b96a8' }}
            >
              Effacer
            </button>
            <button
              onClick={submitDrawing}
              disabled={points.length < 3}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
              style={{ background: '#fbbf24', color: '#2a1d00' }}
            >
              Valider ✓
            </button>
          </>
        )}

        {phase === 'result' && (
          <button
            onClick={reset}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: '#181f2c', border: '1px solid #2c3647', color: '#e8ecef' }}
          >
            ↺ Rejouer
          </button>
        )}
      </div>
    </div>
  )
}
