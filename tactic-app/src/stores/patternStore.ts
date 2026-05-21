import { create } from 'zustand'
import type { Pattern, Player, Keyframe, Vec2, Team } from '@/types'
import { genId } from '@/lib/id'
import { getPositionAtTime } from '@/lib/interpolation'
import { patternRepository } from '@/services/storage'

const TEAM_COLORS: Record<Team, string> = { A: '#f97316', B: '#3b82f6' }

function randomPosition(existing: Player[], team: Team): Vec2 {
  const zone =
    team === 'A'
      ? { xMin: 0.12, xMax: 0.88, yMin: 0.08, yMax: 0.68 }
      : { xMin: 0.12, xMax: 0.88, yMin: 0.32, yMax: 0.92 }
  const MIN_PX = 8 // min distance in SVG units (68×60)

  for (let attempt = 0; attempt < 20; attempt++) {
    const x = zone.xMin + Math.random() * (zone.xMax - zone.xMin)
    const y = zone.yMin + Math.random() * (zone.yMax - zone.yMin)
    const tooClose = existing.some((p) => {
      const kf = p.keyframes[0]
      if (!kf) return false
      const dx = (kf.position.x - x) * 68
      const dy = (kf.position.y - y) * 60
      return Math.hypot(dx, dy) < MIN_PX
    })
    if (!tooClose) return { x, y }
  }
  return { x: zone.xMin + Math.random() * (zone.xMax - zone.xMin), y: zone.yMin + Math.random() * (zone.yMax - zone.yMin) }
}

interface PatternStore {
  patterns: Pattern[]
  activePatternId: string | null
  selectedPlayerId: string | null
  selectedKeyframeId: string | null
  currentTime: number
  pauseTime: number
  isPlaying: boolean

  loadPatterns: () => void
  createPattern: () => string
  setActivePattern: (id: string) => void
  duplicatePattern: (patternId: string) => string
  deletePattern: (patternId: string) => void
  updatePatternMeta: (patternId: string, meta: Partial<Pick<Pattern, 'name' | 'formation' | 'phase' | 'attackDirection'>>) => void

  addPlayer: (team: Team, count?: number) => void
  selectPlayer: (id: string | null) => void
  deletePlayer: (playerId: string) => void

  movePlayer: (playerId: string, position: Vec2) => void
  addKeyframe: (playerId: string) => void
  deleteKeyframe: (playerId: string, keyframeId: string) => void
  moveKeyframe: (playerId: string, keyframeId: string, time: number) => void

  setCurrentTime: (time: number) => void
  setPauseTime: (time: number) => void
  setIsPlaying: (playing: boolean) => void

  activePattern: () => Pattern | null
  selectedPlayer: () => Player | null
}

export const usePatternStore = create<PatternStore>((set, get) => ({
  patterns: [],
  activePatternId: null,
  selectedPlayerId: null,
  selectedKeyframeId: null,
  currentTime: 0,
  pauseTime: 0.5,
  isPlaying: false,

  loadPatterns() {
    set({ patterns: patternRepository.getAll() })
  },

  createPattern() {
    const pattern: Pattern = {
      id: genId(),
      name: 'Nouveau pattern',
      sport: 'football',
      formation: '4-3-3',
      phase: 'Offensive',
      pauseTime: 0.5,
      duration: 6000,
      attackDirection: 'up',
      players: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    patternRepository.save(pattern)
    set((s) => ({ patterns: [...s.patterns, pattern], activePatternId: pattern.id, currentTime: 0, selectedPlayerId: null }))
    return pattern.id
  },

  setActivePattern(id) {
    const pattern = get().patterns.find((p) => p.id === id)
    set({ activePatternId: id, selectedPlayerId: null, selectedKeyframeId: null, currentTime: 0, pauseTime: pattern?.pauseTime ?? 0.5 })
  },

  duplicatePattern(patternId) {
    const src = get().patterns.find((p) => p.id === patternId)
    if (!src) return patternId
    const copy: Pattern = {
      ...src,
      id: genId(),
      name: `${src.name} (copie)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      players: src.players.map((pl) => ({
        ...pl,
        id: genId(),
        keyframes: pl.keyframes.map((k) => ({ ...k, id: genId() })),
      })),
    }
    patternRepository.save(copy)
    set((s) => ({ patterns: [...s.patterns, copy], activePatternId: copy.id }))
    return copy.id
  },

  deletePattern(patternId) {
    patternRepository.delete(patternId)
    set((s) => {
      const patterns = s.patterns.filter((p) => p.id !== patternId)
      const activePatternId = s.activePatternId === patternId ? (patterns[0]?.id ?? null) : s.activePatternId
      return { patterns, activePatternId, selectedPlayerId: null }
    })
  },

  updatePatternMeta(patternId, meta) {
    const updated = get().patterns.map((p) =>
      p.id !== patternId ? p : { ...p, ...meta, updatedAt: Date.now() },
    )
    const target = updated.find((p) => p.id === patternId)
    if (target) patternRepository.save(target)
    set({ patterns: updated })
  },

  addPlayer(team, count = 1) {
    const { activePatternId, patterns } = get()
    if (!activePatternId) return
    const pattern = patterns.find((p) => p.id === activePatternId)
    if (!pattern) return

    let currentPlayers = [...pattern.players]
    const newPlayers: Player[] = []

    for (let i = 0; i < count; i++) {
      const teamCount = currentPlayers.filter((pl) => pl.team === team).length
      const pos = randomPosition(currentPlayers, team)
      const endPos = randomPosition([...currentPlayers, { id: 'tmp', label: '', team, color: '', keyframes: [{ id: '', time: 0.1, position: pos }] }], team)
      const player: Player = {
        id: genId(),
        label: `${team}${teamCount + 1}`,
        team,
        color: TEAM_COLORS[team],
        keyframes: [
          { id: genId(), time: 0.1, position: pos },
          { id: genId(), time: 0.9, position: endPos },
        ],
      }
      newPlayers.push(player)
      currentPlayers = [...currentPlayers, player]
    }

    const updated = patterns.map((p) =>
      p.id === activePatternId ? { ...p, players: currentPlayers, updatedAt: Date.now() } : p,
    )
    patternRepository.save(updated.find((p) => p.id === activePatternId)!)
    set({ patterns: updated, selectedPlayerId: newPlayers[newPlayers.length - 1]?.id ?? null })
  },

  selectPlayer(id) {
    if (!id) { set({ selectedPlayerId: null, selectedKeyframeId: null }); return }
    const { currentTime, activePatternId, patterns } = get()
    const player = patterns.find((p) => p.id === activePatternId)?.players.find((pl) => pl.id === id)
    const kf = player?.keyframes.find((k) => Math.abs(k.time - currentTime) < 0.015)
    set({ selectedPlayerId: id, selectedKeyframeId: kf?.id ?? null })
  },

  deletePlayer(playerId) {
    const { activePatternId, patterns, selectedPlayerId } = get()
    if (!activePatternId) return
    const updated = patterns.map((p) =>
      p.id !== activePatternId ? p : { ...p, players: p.players.filter((pl) => pl.id !== playerId), updatedAt: Date.now() },
    )
    patternRepository.save(updated.find((p) => p.id === activePatternId)!)
    set({ patterns: updated, selectedPlayerId: selectedPlayerId === playerId ? null : selectedPlayerId, selectedKeyframeId: null })
  },

  movePlayer(playerId, position) {
    const { activePatternId, patterns, currentTime } = get()
    if (!activePatternId) return
    const updated = patterns.map((p) => {
      if (p.id !== activePatternId) return p
      const players = p.players.map((pl) => {
        if (pl.id !== playerId) return pl
        const existing = pl.keyframes.find((k) => Math.abs(k.time - currentTime) < 0.015)
        let keyframes: Keyframe[]
        if (existing) {
          keyframes = pl.keyframes.map((k) => (k.id === existing.id ? { ...k, position } : k))
        } else {
          keyframes = [...pl.keyframes, { id: genId(), time: currentTime, position }]
        }
        return { ...pl, keyframes }
      })
      return { ...p, players, updatedAt: Date.now() }
    })
    patternRepository.save(updated.find((p) => p.id === activePatternId)!)
    set({ patterns: updated })
  },

  addKeyframe(playerId) {
    const { activePatternId, patterns, currentTime } = get()
    if (!activePatternId) return
    const player = patterns.find((p) => p.id === activePatternId)?.players.find((pl) => pl.id === playerId)
    if (!player) return
    const pos = getPositionAtTime(player.keyframes, currentTime)
    const newId = genId()
    const updated = patterns.map((p) =>
      p.id !== activePatternId ? p : {
        ...p,
        players: p.players.map((pl) =>
          pl.id !== playerId ? pl : { ...pl, keyframes: [...pl.keyframes, { id: newId, time: currentTime, position: pos }] },
        ),
        updatedAt: Date.now(),
      },
    )
    patternRepository.save(updated.find((p) => p.id === activePatternId)!)
    set({ patterns: updated, selectedKeyframeId: newId })
  },

  deleteKeyframe(playerId, keyframeId) {
    const { activePatternId, patterns } = get()
    if (!activePatternId) return
    const updated = patterns.map((p) =>
      p.id !== activePatternId ? p : {
        ...p,
        players: p.players.map((pl) =>
          pl.id !== playerId ? pl : { ...pl, keyframes: pl.keyframes.filter((k) => k.id !== keyframeId) },
        ),
        updatedAt: Date.now(),
      },
    )
    patternRepository.save(updated.find((p) => p.id === activePatternId)!)
    set({ patterns: updated, selectedKeyframeId: null })
  },

  moveKeyframe(playerId, keyframeId, time) {
    const { activePatternId, patterns } = get()
    if (!activePatternId) return
    const updated = patterns.map((p) =>
      p.id !== activePatternId ? p : {
        ...p,
        players: p.players.map((pl) =>
          pl.id !== playerId ? pl : { ...pl, keyframes: pl.keyframes.map((k) => (k.id === keyframeId ? { ...k, time } : k)) },
        ),
        updatedAt: Date.now(),
      },
    )
    patternRepository.save(updated.find((p) => p.id === activePatternId)!)
    set({ patterns: updated, currentTime: time })
  },

  setCurrentTime(time) { set({ currentTime: Math.max(0, Math.min(1, time)) }) },

  setPauseTime(time) {
    const clamped = Math.max(0.05, Math.min(0.95, time))
    const { activePatternId, patterns } = get()
    const updated = patterns.map((p) => (p.id === activePatternId ? { ...p, pauseTime: clamped, updatedAt: Date.now() } : p))
    const target = updated.find((p) => p.id === activePatternId)
    if (target) patternRepository.save(target)
    set({ pauseTime: clamped, patterns: updated })
  },

  setIsPlaying(playing) { set({ isPlaying: playing }) },

  activePattern() {
    const { patterns, activePatternId } = get()
    return patterns.find((p) => p.id === activePatternId) ?? null
  },

  selectedPlayer() {
    const pattern = get().activePattern()
    return pattern?.players.find((p) => p.id === get().selectedPlayerId) ?? null
  },
}))
