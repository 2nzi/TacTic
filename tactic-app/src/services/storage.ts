import type { Pattern } from '@/types'

const KEY = 'tactic:patterns'

export const patternRepository = {
  getAll(): Pattern[] {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? (JSON.parse(raw) as Pattern[]) : []
    } catch {
      return []
    }
  },

  save(pattern: Pattern): void {
    const all = patternRepository.getAll()
    const idx = all.findIndex((p) => p.id === pattern.id)
    if (idx >= 0) {
      all[idx] = pattern
    } else {
      all.push(pattern)
    }
    localStorage.setItem(KEY, JSON.stringify(all))
  },

  delete(id: string): void {
    const all = patternRepository.getAll().filter((p) => p.id !== id)
    localStorage.setItem(KEY, JSON.stringify(all))
  },
}
