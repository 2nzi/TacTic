import { useEffect } from 'react'
import { usePatternStore } from '@/stores/patternStore'
import { SwipePanel } from '@/components/SwipePanel'
import { PitchSVG } from './components/PitchSVG'
import { Timeline } from './components/Timeline'
import { ParamsPanel } from './components/ParamsPanel'
import { PropertiesPanel } from './components/PropertiesPanel'
import { Roster } from './components/Roster'
import { Inspector } from './components/Inspector'

export function CoachEditor() {
  const loadPatterns = usePatternStore((s) => s.loadPatterns)
  const createPattern = usePatternStore((s) => s.createPattern)
  const activePattern = usePatternStore((s) => s.activePattern())

  useEffect(() => {
    loadPatterns()
  }, [loadPatterns])

  if (!activePattern) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-sm" style={{ color: '#5a6478' }}>No pattern yet</p>
        <button
          onClick={createPattern}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          style={{ background: '#06b6d4', color: '#06222a' }}
        >
          Create first pattern
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Context chips */}
      <div
        className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto shrink-0"
        style={{ borderBottom: '1px solid #1f2735', background: '#0a0e14', scrollbarWidth: 'none' }}
      >
        {[
          { key: 'Sport', val: 'Football' },
          { key: 'Phase', val: activePattern.phase || 'Demi off.' },
          { key: 'Duration', val: `${(activePattern.duration / 1000).toFixed(0)}s` },
        ].map((chip) => (
          <div
            key={chip.key}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0"
            style={{ background: '#181f2c', border: '1px solid #1f2735' }}
          >
            <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: '#5a6478' }}>
              {chip.key}
            </span>
            <span className="text-xs font-medium">{chip.val}</span>
          </div>
        ))}
      </div>

      {/* TOP: Pitch + Params (swipeable, takes remaining space minus bottom) */}
      <SwipePanel
        className="flex-1 min-h-0"
        tabs={[
          {
            id: 'pitch',
            label: 'Terrain',
            content: (
              <div className="flex flex-col h-full">
                <div className="flex-1 min-h-0 p-2">
                  <PitchSVG />
                </div>
              </div>
            ),
          },
          {
            id: 'params',
            label: 'Paramètres',
            content: (
              <div className="h-full overflow-y-auto" style={{ background: '#0a0e14' }}>
                <ParamsPanel />
              </div>
            ),
          },
        ]}
      />

      {/* Roster strip */}
      <Roster />

      {/* Inspector strip */}
      <Inspector />

      {/* BOTTOM: Timeline + Properties (swipeable, fixed height) */}
      <div
        className="shrink-0"
        style={{
          height: '196px',
          borderTop: '1px solid #1f2735',
          background: 'linear-gradient(180deg, #11161f 0%, #0d121b 100%)',
        }}
      >
        <SwipePanel
          className="h-full"
          tabs={[
            {
              id: 'timeline',
              label: 'Timeline',
              content: <Timeline />,
            },
            {
              id: 'props',
              label: 'Propriétés',
              content: <PropertiesPanel />,
            },
          ]}
        />
      </div>
    </div>
  )
}
