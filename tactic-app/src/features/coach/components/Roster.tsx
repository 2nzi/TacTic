import { usePatternStore } from '@/stores/patternStore'

export function Roster() {
  const pattern = usePatternStore((s) => s.activePattern())
  const selectedPlayerId = usePatternStore((s) => s.selectedPlayerId)
  const selectPlayer = usePatternStore((s) => s.selectPlayer)

  if (!pattern || pattern.players.length === 0) return null

  const teamA = pattern.players.filter((p) => p.team === 'A')
  const teamB = pattern.players.filter((p) => p.team === 'B')

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto shrink-0"
      style={{ scrollbarWidth: 'none', borderTop: '1px solid #1f2735', background: '#0a0e14' }}
    >
      {teamA.map((p) => (
        <button
          key={p.id}
          onClick={() => selectPlayer(p.id)}
          className="flex-none w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all"
          style={{
            backgroundColor: p.color,
            color: '#1a0a02',
            border: selectedPlayerId === p.id ? '2px solid #fff' : '2px solid transparent',
            boxShadow: selectedPlayerId === p.id ? `0 0 0 2px ${p.color}44` : 'none',
          }}
        >
          {p.label}
        </button>
      ))}

      {teamA.length > 0 && teamB.length > 0 && (
        <div className="w-px h-5 mx-0.5 shrink-0" style={{ background: '#2c3647' }} />
      )}

      {teamB.map((p) => (
        <button
          key={p.id}
          onClick={() => selectPlayer(p.id)}
          className="flex-none w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all"
          style={{
            backgroundColor: p.color,
            color: '#08172e',
            border: selectedPlayerId === p.id ? '2px solid #fff' : '2px solid transparent',
            boxShadow: selectedPlayerId === p.id ? `0 0 0 2px ${p.color}44` : 'none',
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
