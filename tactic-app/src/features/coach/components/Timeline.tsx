import { useRef, useCallback, useEffect } from 'react'
import { usePatternStore } from '@/stores/patternStore'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'

function formatTime(t: number): string {
  const s = Math.floor(t)
  const ms = Math.round((t - s) * 100)
  return `${s}.${String(ms).padStart(2, '0')}s`
}

export function Timeline() {
  const pattern = usePatternStore((s) => s.activePattern())
  const currentTime = usePatternStore((s) => s.currentTime)
  const pauseTime = usePatternStore((s) => s.pauseTime)
  const isPlaying = usePatternStore((s) => s.isPlaying)
  const selectedPlayerId = usePatternStore((s) => s.selectedPlayerId)
  const setCurrentTime = usePatternStore((s) => s.setCurrentTime)
  const setIsPlaying = usePatternStore((s) => s.setIsPlaying)
  const moveKeyframe = usePatternStore((s) => s.moveKeyframe)
  const selectPlayer = usePatternStore((s) => s.selectPlayer)

  const trackRef = useRef<HTMLDivElement>(null)
  const currentTimeRef = useRef(currentTime)
  currentTimeRef.current = currentTime

  const duration = pattern?.duration ?? 4000
  const durationSec = duration / 1000

  const handleTick = useCallback(
    (elapsed: number) => {
      const t = elapsed / duration
      if (t >= 1) {
        setCurrentTime(1)
        setIsPlaying(false)
        loop.stop()
        return
      }
      setCurrentTime(t)
    },
    [duration, setCurrentTime, setIsPlaying],
  )

  const loop = useAnimationLoop(handleTick)

  useEffect(() => {
    if (isPlaying) {
      loop.start(currentTimeRef.current * duration)
    } else {
      loop.stop()
    }
    return () => loop.stop()
  }, [isPlaying])

  const getTimeFromPointer = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return 0
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }

  const onTrackPointerDown = (e: React.PointerEvent) => {
    if (isPlaying) setIsPlaying(false)
    const t = getTimeFromPointer(e.clientX)
    setCurrentTime(t)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onTrackPointerMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1) return
    setCurrentTime(getTimeFromPointer(e.clientX))
  }

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else {
      if (currentTime >= 1) setCurrentTime(0)
      setIsPlaying(true)
    }
  }

  const jumpToPause = () => {
    setIsPlaying(false)
    setCurrentTime(pauseTime)
  }

  const onPauseExact = Math.abs(currentTime - pauseTime) < 0.015

  if (!pattern) {
    return (
      <div className="flex items-center justify-center h-full text-xs" style={{ color: '#5a6478' }}>
        No pattern selected
      </div>
    )
  }

  const selectedPlayer = pattern.players.find((p) => p.id === selectedPlayerId)
  const selectedTrack = selectedPlayer?.keyframes ?? []

  return (
    <div className="flex flex-col h-full px-3 py-2 gap-2">
      {/* Controls row */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
          style={{ background: isPlaying ? '#fbbf24' : '#06b6d4', color: isPlaying ? '#2a1d00' : '#06222a' }}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="font-mono text-sm leading-none" style={{ color: '#e8ecef' }}>
          {formatTime(currentTime * durationSec)}
          <span style={{ color: '#5a6478' }}> / {formatTime(durationSec)}</span>
        </div>

        <div className="flex-1" />

        <button
          onClick={jumpToPause}
          className="h-7 px-2.5 rounded-lg font-mono text-[10px] uppercase tracking-wider flex items-center gap-1 transition-colors"
          style={{
            background: onPauseExact ? '#fbbf2422' : 'transparent',
            border: `1px solid ${onPauseExact ? '#fbbf24' : '#1f2735'}`,
            color: onPauseExact ? '#fbbf24' : '#5a6478',
          }}
        >
          ⏸ Pause
        </button>
      </div>

      {/* Track */}
      {selectedPlayer ? (
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: selectedPlayer.color }}
            />
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#e8ecef' }}>
              {selectedPlayer.label}
            </span>
            <span className="font-mono text-[10px]" style={{ color: '#5a6478' }}>
              {selectedTrack.length} kf
            </span>
          </div>

          <div
            ref={trackRef}
            className="relative h-16 rounded-lg cursor-ew-resize"
            style={{ background: '#181f2c', border: '1px solid #1f2735', touchAction: 'none' }}
            onPointerDown={onTrackPointerDown}
            onPointerMove={onTrackPointerMove}
          >
            {/* Second marks */}
            {Array.from({ length: Math.floor(durationSec) + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px pointer-events-none"
                style={{ left: `${(i / durationSec) * 100}%`, background: 'rgba(255,255,255,0.04)' }}
              >
                <span
                  className="absolute top-1 left-1 font-mono"
                  style={{ fontSize: '9px', color: '#5a6478' }}
                >
                  {i}s
                </span>
              </div>
            ))}

            {/* Pause line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 z-10 pointer-events-none"
              style={{ left: `${pauseTime * 100}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute inset-0" style={{ background: '#fbbf24', opacity: 0.9 }} />
              <div
                className="absolute inset-0 blur-sm"
                style={{ background: '#fbbf24', width: '8px', left: '-3px', opacity: 0.3 }}
              />
              <span
                className="absolute font-mono uppercase tracking-wider"
                style={{
                  top: '4px',
                  left: '4px',
                  fontSize: '8px',
                  color: '#fbbf24',
                  background: 'rgba(10,14,20,0.8)',
                  border: '1px solid #fbbf24',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  whiteSpace: 'nowrap',
                }}
              >
                PAUSE
              </span>
            </div>

            {/* Keyframe diamonds */}
            {selectedTrack.map((kf, i) => {
              const isActive = Math.abs(kf.time - currentTime) < 0.015
              const isPause = Math.abs(kf.time - pauseTime) < 0.05
              const color = isPause ? '#fbbf24' : '#06b6d4'
              return (
                <div
                  key={kf.id}
                  className="absolute z-20 flex items-center justify-center"
                  style={{
                    left: `${kf.time * 100}%`,
                    bottom: '14px',
                    transform: `translate(-50%, 50%) rotate(45deg) scale(${isActive ? 1.2 : 1})`,
                    width: isPause ? '18px' : '14px',
                    height: isPause ? '18px' : '14px',
                    background: color,
                    border: '2px solid #fff',
                    borderRadius: '3px',
                    boxShadow: isActive ? `0 0 0 3px rgba(10,14,20,0.7), 0 0 0 6px ${color}33` : '0 0 0 3px rgba(10,14,20,0.6)',
                    cursor: 'pointer',
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    setCurrentTime(kf.time)
                    selectPlayer(selectedPlayer.id)
                    const container = trackRef.current
                    if (!container) return
                    const onMove = (me: PointerEvent) => {
                      const rect = container.getBoundingClientRect()
                      const t = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width))
                      moveKeyframe(selectedPlayer.id, kf.id, t)
                    }
                    const onUp = () => {
                      window.removeEventListener('pointermove', onMove)
                      window.removeEventListener('pointerup', onUp)
                    }
                    window.addEventListener('pointermove', onMove)
                    window.addEventListener('pointerup', onUp)
                  }}
                >
                  <span
                    className="font-mono font-bold"
                    style={{ fontSize: '8px', color: '#06222a', transform: 'rotate(-45deg)' }}
                  >
                    {i + 1}
                  </span>
                </div>
              )
            })}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white z-30 pointer-events-none"
              style={{ left: `${currentTime * 100}%`, transform: 'translateX(-50%)' }}
            >
              <div
                className="absolute font-mono font-semibold"
                style={{
                  top: '-18px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '9px',
                  color: '#06222a',
                  background: '#fff',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatTime(currentTime * durationSec)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1 text-xs" style={{ color: '#5a6478' }}>
          Select a player to edit keyframes
        </div>
      )}
    </div>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M6 4l14 8-14 8z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  )
}
