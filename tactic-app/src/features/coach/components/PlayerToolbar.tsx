import { usePatternStore } from '@/stores/patternStore'

export function PlayerToolbar() {
  const addPlayer = usePatternStore((s) => s.addPlayer)
  const pattern = usePatternStore((s) => s.activePattern())

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="text-xs text-white/40 font-semibold uppercase tracking-widest">Teams</div>

      <button
        onClick={() => addPlayer('A')}
        className="w-full py-2.5 rounded-lg font-bold text-sm text-black transition-colors hover:opacity-80"
        style={{ backgroundColor: '#2ecc71' }}
      >
        + Team A player
      </button>

      <button
        onClick={() => addPlayer('B')}
        className="w-full py-2.5 rounded-lg font-bold text-sm transition-colors hover:opacity-80"
        style={{ backgroundColor: '#e056fd' }}
      >
        + Team B player
      </button>

      {pattern && pattern.players.length > 0 && (
        <>
          <div className="mt-2 text-xs text-white/40 font-semibold uppercase tracking-widest">Players</div>
          <div className="flex flex-col gap-1">
            {pattern.players.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 text-sm py-1"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="font-mono text-white/70">{p.label}</span>
                <span className="text-white/30 text-xs ml-auto">{p.keyframes.length} kf</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
