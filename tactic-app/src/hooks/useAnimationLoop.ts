import { useCallback, useRef } from 'react'

export function useAnimationLoop(onTick: (elapsed: number) => void) {
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  const start = useCallback(
    (startFrom = 0) => {
      const now = performance.now()
      startTimeRef.current = now - startFrom

      const loop = (ts: number) => {
        const elapsed = ts - startTimeRef.current
        onTick(elapsed)
        rafRef.current = requestAnimationFrame(loop)
      }

      rafRef.current = requestAnimationFrame(loop)
    },
    [onTick],
  )

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  return { start, stop }
}
