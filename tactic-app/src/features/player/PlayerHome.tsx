import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { usePatternStore } from '@/stores/patternStore'
import { getPositionAtTime } from '@/lib/interpolation'
import type { Pattern } from '@/types'

function PatternThumb({ pattern }: { pattern: Pattern }) {
  return (
    <svg viewBox="0 0 68 60" className="w-full h-full" style={{ background: '#0e3a2a', borderRadius: '8px' }}>
      <rect x="1" y="1" width="66" height="58" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
      <line x1="1" y1="55" x2="67" y2="55" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />
      {pattern.players.map((p) => {
        const pos = getPositionAtTime(p.keyframes, pattern.pauseTime)
        return <circle key={p.id} cx={pos.x * 68} cy={pos.y * 60} r="2.5" fill={p.color} />
      })}
    </svg>
  )
}

export function PlayerHome() {
  const navigate = useNavigate()
  const patterns = usePatternStore((s) => s.patterns)
  const loadPatterns = usePatternStore((s) => s.loadPatterns)
  const setActivePattern = usePatternStore((s) => s.setActivePattern)

  useEffect(() => { loadPatterns() }, [loadPatterns])

  const handleSelect = (patternId: string) => {
    setActivePattern(patternId)
    navigate(`/player/${patternId}`)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#0a0e14' }}>
      <div className="px-4 pt-4 pb-3 shrink-0" style={{ borderBottom: '1px solid #1f2735' }}>
        <h2 className="text-base font-bold mb-0.5">Découverte</h2>
        <p className="text-xs" style={{ color: '#5a6478' }}>Sélectionne une situation à pratiquer</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {patterns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm" style={{ color: '#5a6478' }}>Aucune situation disponible.</p>
            <p className="text-xs mt-1" style={{ color: '#5a6478' }}>Demande à un coach d'en créer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {patterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => handleSelect(pattern.id)}
                className="text-left rounded-xl overflow-hidden transition-all active:scale-[0.97]"
                style={{ background: '#11161f', border: '1px solid #1f2735' }}
              >
                <div className="aspect-[68/60] w-full">
                  <PatternThumb pattern={pattern} />
                </div>
                <div className="px-3 py-2">
                  <div className="text-sm font-semibold truncate">{pattern.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                      style={{ background: '#fbbf2422', color: '#fbbf24' }}
                    >
                      {pattern.phase}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: '#5a6478' }}>
                      {pattern.players.length}J
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
