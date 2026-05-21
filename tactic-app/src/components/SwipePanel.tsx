import { useState, useRef, type ReactNode } from 'react'

export interface SwipeTab {
  id: string
  label: string
  content: ReactNode
}

interface SwipePanelProps {
  tabs: SwipeTab[]
  className?: string
}

export function SwipePanel({ tabs, className = '' }: SwipePanelProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startIdxRef = useRef(0)
  const isDraggingRef = useRef(false)
  const currentDeltaRef = useRef(0)

  const clampIdx = (i: number) => Math.max(0, Math.min(tabs.length - 1, i))

  const onPointerDown = (e: React.PointerEvent) => {
    if (tabs.length <= 1) return
    isDraggingRef.current = true
    startXRef.current = e.clientX
    startIdxRef.current = activeIdx
    currentDeltaRef.current = 0
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !trackRef.current) return
    const delta = e.clientX - startXRef.current
    const width = trackRef.current.offsetWidth
    currentDeltaRef.current = delta
    const offset = -(startIdxRef.current * width) + delta
    trackRef.current.style.transition = 'none'
    trackRef.current.style.transform = `translateX(${offset}px)`
  }

  const onPointerUp = () => {
    if (!isDraggingRef.current || !trackRef.current) return
    isDraggingRef.current = false
    const width = trackRef.current.offsetWidth
    const threshold = width * 0.28
    const delta = currentDeltaRef.current

    let next = startIdxRef.current
    if (delta < -threshold) next = clampIdx(startIdxRef.current + 1)
    else if (delta > threshold) next = clampIdx(startIdxRef.current - 1)

    setActiveIdx(next)
    trackRef.current.style.transition = 'transform 220ms cubic-bezier(0.3, 0.7, 0.4, 1)'
    trackRef.current.style.transform = `translateX(${-next * width}px)`
  }

  return (
    <div className={`flex flex-col overflow-hidden ${className}`}>
      {/* Tab pills */}
      <div className="flex items-center gap-1 px-3 pt-2 pb-1 shrink-0">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveIdx(i)
              if (trackRef.current) {
                const width = trackRef.current.offsetWidth
                trackRef.current.style.transition = 'transform 220ms cubic-bezier(0.3, 0.7, 0.4, 1)'
                trackRef.current.style.transform = `translateX(${-i * width}px)`
              }
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeIdx === i
                ? 'bg-white/15 text-white'
                : 'text-[#5a6478] hover:text-[#8b96a8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Swipe area */}
      <div
        className="flex-1 overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          ref={trackRef}
          className="flex h-full"
          style={{
            width: `${tabs.length * 100}%`,
            transform: `translateX(${-activeIdx * (100 / tabs.length)}%)`,
            transition: 'transform 220ms cubic-bezier(0.3, 0.7, 0.4, 1)',
          }}
        >
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="h-full overflow-hidden"
              style={{ width: `${100 / tabs.length}%` }}
            >
              {tab.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
