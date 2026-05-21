import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { usePatternStore } from '@/stores/patternStore'
import { getPositionAtTime } from '@/lib/interpolation'
import type { Pattern } from '@/types'

const PHASES = ['Tout', 'Offensive', 'Défensive', 'Transition', 'Coup franc', 'Corner']

function PatternThumbnail({ pattern }: { pattern: Pattern }) {
  return (
    <svg viewBox="0 0 68 60" className="w-full h-full" style={{ borderRadius: '8px', background: '#0e3a2a' }}>
      {/* Minimal pitch lines */}
      <rect x="1" y="1" width="66" height="58" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      <line x1="1" y1="55" x2="67" y2="55" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
      <rect x="24.34" y="1" width="19.32" height="5" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
      {/* Players at pauseTime */}
      {pattern.players.map((p) => {
        const pos = getPositionAtTime(p.keyframes, pattern.pauseTime)
        return <circle key={p.id} cx={pos.x * 68} cy={pos.y * 60} r="2.8" fill={p.color} />
      })}
      {pattern.players.length === 0 && (
        <text x="34" y="32" textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.2)" fontFamily="sans-serif">
          Vide
        </text>
      )}
    </svg>
  )
}

function PatternCard({ pattern }: { pattern: Pattern }) {
  const navigate = useNavigate()
  const setActivePattern = usePatternStore((s) => s.setActivePattern)
  const duplicatePattern = usePatternStore((s) => s.duplicatePattern)
  const deletePattern = usePatternStore((s) => s.deletePattern)
  const [menuOpen, setMenuOpen] = useState(false)

  const open = () => {
    setActivePattern(pattern.id)
    navigate(`/coach/${pattern.id}`)
  }

  return (
    <div
      className="rounded-xl overflow-hidden relative transition-all active:scale-[0.98]"
      style={{ background: '#11161f', border: '1px solid #1f2735' }}
    >
      {/* Thumbnail */}
      <div className="aspect-[68/60] w-full cursor-pointer" onClick={open}>
        <PatternThumbnail pattern={pattern} />
      </div>

      {/* Info bar */}
      <div className="px-3 py-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1" onClick={open} style={{ cursor: 'pointer' }}>
          <div className="text-sm font-semibold truncate">{pattern.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-mono"
              style={{ background: '#06b6d422', color: '#06b6d4' }}
            >
              {pattern.phase}
            </span>
            <span className="text-[10px] font-mono" style={{ color: '#5a6478' }}>
              {pattern.formation} · {pattern.players.length}J
            </span>
          </div>
        </div>

        {/* Context menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#5a6478' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute right-0 top-8 z-20 rounded-xl overflow-hidden shadow-2xl"
                style={{ background: '#181f2c', border: '1px solid #2c3647', minWidth: '160px' }}
              >
                <button
                  onClick={() => { open(); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors hover:bg-white/5"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Éditer
                </button>
                <button
                  onClick={() => { duplicatePattern(pattern.id); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors hover:bg-white/5"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                  Dupliquer
                </button>
                <div className="h-px mx-2" style={{ background: '#2c3647' }} />
                <button
                  onClick={() => { deletePattern(pattern.id); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors hover:bg-red-500/10"
                  style={{ color: '#ef4444' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M9 6V4h6v2" /></svg>
                  Supprimer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function PatternList() {
  const navigate = useNavigate()
  const patterns = usePatternStore((s) => s.patterns)
  const loadPatterns = usePatternStore((s) => s.loadPatterns)
  const createPattern = usePatternStore((s) => s.createPattern)
  const [search, setSearch] = useState('')
  const [phase, setPhase] = useState('Tout')

  useEffect(() => { loadPatterns() }, [loadPatterns])

  const filtered = patterns.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchPhase = phase === 'Tout' || p.phase === phase
    return matchSearch && matchPhase
  })

  const handleCreate = () => {
    const id = createPattern()
    navigate(`/coach/${id}`)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#0a0e14' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 shrink-0" style={{ borderBottom: '1px solid #1f2735' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Situations</h2>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: '#06b6d4', color: '#06222a' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Créer
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5a6478" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm rounded-lg pl-8 pr-3 py-2 outline-none"
            style={{ background: '#181f2c', border: '1px solid #1f2735', color: '#e8ecef' }}
          />
        </div>

        {/* Phase filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          {PHASES.map((ph) => (
            <button
              key={ph}
              onClick={() => setPhase(ph)}
              className="flex-none px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: phase === ph ? '#06b6d422' : '#181f2c',
                border: `1px solid ${phase === ph ? '#06b6d4' : '#1f2735'}`,
                color: phase === ph ? '#06b6d4' : '#8b96a8',
              }}
            >
              {ph}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div style={{ color: '#5a6478' }} className="text-sm">
              {patterns.length === 0 ? 'Aucune situation' : 'Aucun résultat'}
            </div>
            {patterns.length === 0 && (
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: '#06b6d422', border: '1px solid #06b6d4', color: '#06b6d4' }}
              >
                Créer la première
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <PatternCard key={p.id} pattern={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
