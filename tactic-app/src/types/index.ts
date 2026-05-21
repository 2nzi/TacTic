export type PlayerId = string
export type PatternId = string
export type KeyframeId = string

export type AttackDirection = 'up' | 'down'
export type Team = 'A' | 'B'
export type Sport = 'football'

export interface Vec2 {
  x: number
  y: number
}

export interface Keyframe {
  id: KeyframeId
  time: number
  position: Vec2
}

export interface Player {
  id: PlayerId
  label: string
  team: Team
  color: string
  keyframes: Keyframe[]
}

export interface Pattern {
  id: PatternId
  name: string
  sport: Sport
  formation: string
  phase: string
  pauseTime: number
  duration: number
  attackDirection: AttackDirection
  players: Player[]
  createdAt: number
  updatedAt: number
}

export type AppRole = 'coach' | 'player'

export interface PlayerDrawing {
  playerId: PlayerId
  points: Vec2[]
}

export interface QuizAttempt {
  patternId: PatternId
  drawings: PlayerDrawing[]
  scores: Record<PlayerId, number>
  completedAt: number
}
