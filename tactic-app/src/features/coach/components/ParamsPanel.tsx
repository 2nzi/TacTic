import { useState } from 'react'
import { usePatternStore } from '@/stores/patternStore'
import type { Team } from '@/types'

function PlayerRow({ playerId, label, color, kfCount }: { playerId: string; label: string; color: string; kfCount: number }) {
  const deletePlayer = usePatternStore((s) => s.deletePlayer)
  const selectPlayer = usePatternStore((s) => s.selectPlayer)
  const selectedPlayerId = usePatternStore((s) => s.selectedPlayerId)
  const isSelected = selectedPlayerId === playerId

  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors"
      style={{ background: isSelected ? '#1f2735' : 'transparent' }}
      onClick={() => selectPlayer(playerId)}
    >
      <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[10px] shrink-0"
        style={{ backgroundColor: color, color: color === '#3b82f6' ? '#08172e' : '#1a0a02' }}>
        {label}
      </div>
      <span className="text-xs flex-1" style={{ color: '#e8ecef' }}>{label}</span>
      <span className="font-mono text-[10px]" style={{ color: '#5a6478' }}>{kfCount} KF</span>
      <button
        onClick={(e) => { e.stopPropagation(); deletePlayer(playerId) }}
        className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:bg-red-500/20"
        style={{ color: '#5a6478' }}
        title="Delete player"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>
    </div>
  )
}

function AddPlayerSection({ team }: { team: Team }) {
  const [count, setCount] = useState(1)
  const addPlayer = usePatternStore((s) => s.addPlayer)
  const pattern = usePatternStore((s) => s.activePattern())
  const color = team === 'A' ? '#f97316' : '#3b82f6'
  const teamPlayers = pattern?.players.filter((p) => p.team === team) ?? []

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-xs font-medium flex-1">Team {team}</span>
        <span className="font-mono text-[10px]" style={{ color: '#5a6478' }}>{teamPlayers.length} joueurs</span>
      </div>

      {/* Player list */}
      {teamPlayers.length > 0 && (
        <div className="mb-2 flex flex-col gap-0.5">
          {teamPlayers.map((p) => (
            <PlayerRow key={p.id} playerId={p.id} label={p.label} color={p.color} kfCount={p.keyframes.length} />
          ))}
        </div>
      )}

      {/* Add row */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCount((c) => Math.max(1, c - 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
          style={{ background: '#181f2c', border: '1px solid #1f2735', color: '#e8ecef' }}
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={11}
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(11, Number(e.target.value) || 1)))}
          className="w-10 text-center text-sm font-mono rounded-lg outline-none"
          style={{ background: '#181f2c', border: '1px solid #1f2735', color: '#e8ecef', height: '28px' }}
        />
        <button
          onClick={() => setCount((c) => Math.min(11, c + 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
          style={{ background: '#181f2c', border: '1px solid #1f2735', color: '#e8ecef' }}
        >
          +
        </button>
        <button
          onClick={() => addPlayer(team, count)}
          className="flex-1 h-7 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: `${color}22`, border: `1px solid ${color}55`, color }}
        >
          + Ajouter {count > 1 ? `(${count})` : ''}
        </button>
      </div>
    </div>
  )
}

export function ParamsPanel() {
  const pattern = usePatternStore((s) => s.activePattern())
  const updatePatternMeta = usePatternStore((s) => s.updatePatternMeta)

  if (!pattern) return null

  const phases = ['Offensive', 'Défensive', 'Transition', 'Coup franc', 'Corner']

  return (
    <div className="flex flex-col gap-5 p-4 overflow-y-auto">

      {/* Pattern name */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: '#5a6478' }}>Nom</div>
        <input
          type="text"
          value={pattern.name}
          onChange={(e) => updatePatternMeta(pattern.id, { name: e.target.value })}
          className="w-full text-sm rounded-lg px-3 py-2 outline-none"
          style={{ background: '#181f2c', border: '1px solid #1f2735', color: '#e8ecef' }}
        />
      </div>

      {/* Phase */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: '#5a6478' }}>Phase</div>
        <div className="flex flex-wrap gap-1.5">
          {phases.map((ph) => (
            <button
              key={ph}
              onClick={() => updatePatternMeta(pattern.id, { phase: ph })}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: pattern.phase === ph ? '#06b6d422' : '#181f2c',
                border: `1px solid ${pattern.phase === ph ? '#06b6d4' : '#1f2735'}`,
                color: pattern.phase === ph ? '#06b6d4' : '#8b96a8',
              }}
            >
              {ph}
            </button>
          ))}
        </div>
      </div>

      {/* Formation */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: '#5a6478' }}>Formation</div>
        <select
          value={pattern.formation}
          onChange={(e) => updatePatternMeta(pattern.id, { formation: e.target.value })}
          className="w-full text-sm rounded-lg px-3 py-2 outline-none appearance-none"
          style={{ background: '#181f2c', border: '1px solid #1f2735', color: '#e8ecef' }}
        >
          {['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '3-4-3', '5-3-2', '4-1-4-1'].map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <div className="w-full h-px" style={{ background: '#1f2735' }} />

      {/* Team A */}
      <AddPlayerSection team="A" />

      {/* Divider */}
      <div className="w-full h-px" style={{ background: '#1f2735' }} />

      {/* Team B */}
      <AddPlayerSection team="B" />
    </div>
  )
}
