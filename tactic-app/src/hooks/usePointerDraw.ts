import { useEffect, useRef, useState } from 'react'
import type { Vec2 } from '@/types'

export function usePointerDraw(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [points, setPoints] = useState<Vec2[]>([])
  const drawing = useRef(false)
  const pointsRef = useRef<Vec2[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getPoint = (e: PointerEvent): Vec2 => {
      const rect = canvas.getBoundingClientRect()
      return {
        x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
      }
    }

    const onDown = (e: PointerEvent) => {
      drawing.current = true
      canvas.setPointerCapture(e.pointerId)
      const p = getPoint(e)
      pointsRef.current = [p]
      setPoints([p])
    }

    const onMove = (e: PointerEvent) => {
      if (!drawing.current) return
      const p = getPoint(e)
      pointsRef.current = [...pointsRef.current, p]
      setPoints([...pointsRef.current])
    }

    const onUp = () => { drawing.current = false }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)

    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
    }
  }, [canvasRef])

  const clear = () => {
    pointsRef.current = []
    setPoints([])
  }

  return { points, clear }
}
