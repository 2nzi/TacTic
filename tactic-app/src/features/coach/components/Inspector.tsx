import { usePatternStore } from '@/stores/patternStore'

export function Inspector() {
  const player = usePatternStore((s) => s.selectedPlayer())
  const selectPlayer = usePatternStore((s) => s.selectPlayer)

  if (!player) {
    return (
      <div
        className="flex items-center px-3 py-2 shrink-0"
        style={{ borderTop: '1px solid #1f2735', background: '#11161f' }}
      >
        <span className="text-xs" style={{ color: '#5a6478' }}>
          Select a player on the pitch
        </span>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 shrink-0"
      style={{ borderTop: '1px solid #1f2735', background: '#11161f' }}
    >
      {/* Player pill */}
      <div
        className="flex items-center gap-2 pl-0.5 pr-2.5 py-0.5 rounded-full"
        style={{ background: '#181f2c', border: '1px solid #1f2735' }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs"
          style={{
            backgroundColor: player.color,
            color: player.team === 'B' ? '#08172e' : '#1a0a02',
          }}
        >
          {player.label}
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: '#5a6478' }}>
            Team {player.team}{player.team === 'B' ? ' · Adv' : ''}
          </span>
          <span className="text-xs font-medium" style={{ color: '#e8ecef' }}>
            Player {player.label}
          </span>
        </div>
      </div>

      <div className="flex-1" />

      <button
        onClick={() => selectPlayer(null)}
        className="h-7 px-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors"
        style={{
          background: 'transparent',
          border: '1px solid #1f2735',
          color: '#5a6478',
        }}
      >
        ✕
      </button>
    </div>
  )
}
