import { usePatternStore } from '@/stores/patternStore'

export function PropertiesPanel() {
  const player = usePatternStore((s) => s.selectedPlayer())
  const currentTime = usePatternStore((s) => s.currentTime)
  const selectedKeyframeId = usePatternStore((s) => s.selectedKeyframeId)
  const addKeyframe = usePatternStore((s) => s.addKeyframe)
  const deleteKeyframe = usePatternStore((s) => s.deleteKeyframe)

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <span className="text-xs" style={{ color: '#5a6478' }}>
          Select a player on the pitch
        </span>
      </div>
    )
  }

  const hasKfAtTime = player.keyframes.some((k) => Math.abs(k.time - currentTime) < 0.015)

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm"
          style={{ backgroundColor: player.color, color: player.team === 'B' ? '#08172e' : '#1a0a02' }}
        >
          {player.label}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold">{player.label}</span>
          <span className="font-mono text-[10px]" style={{ color: '#5a6478' }}>
            Team {player.team} · {player.keyframes.length} kf
          </span>
        </div>
      </div>

      {!hasKfAtTime && (
        <button
          onClick={() => addKeyframe(player.id)}
          className="w-full py-2 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: '#22c55e22', border: '1px solid #22c55e88', color: '#22c55e' }}
        >
          + Add keyframe here
        </button>
      )}

      {selectedKeyframeId && (
        <button
          onClick={() => deleteKeyframe(player.id, selectedKeyframeId)}
          className="w-full py-2 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: '#ef444422', border: '1px solid #ef444488', color: '#ef4444' }}
        >
          Delete keyframe
        </button>
      )}
    </div>
  )
}
