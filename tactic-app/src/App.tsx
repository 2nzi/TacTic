import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router'
import { useEffect, useState } from 'react'
import { HomeScreen } from './screens/HomeScreen'
import { PatternList } from './features/coach/PatternList'
import { CoachEditor } from './features/coach/CoachEditor'
import { PlayerHome } from './features/player/PlayerHome'
import { PlayerSession } from './features/player/PlayerSession'
import { usePatternStore } from './stores/patternStore'

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => setDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return desktop
}

// ─── Desktop shell ─────────────────────────────────────────────────────────────
function DesktopShell() {
  const location = useLocation()
  const isCoach = location.pathname.startsWith('/coach')
  const isPlayer = location.pathname.startsWith('/player')
  const pattern = usePatternStore((s) => s.activePattern())

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: '#06080c' }}>
      {/* Top nav */}
      <header
        className="flex items-center gap-4 px-6 py-3 shrink-0"
        style={{ borderBottom: '1px solid #1f2735', background: '#0a0e14' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#06b6d4', boxShadow: '0 0 8px #06b6d4' }} />
          <span className="font-bold text-sm tracking-tight">TacTic</span>
        </div>

        <nav className="flex gap-1 ml-4">
          <NavLink to="/coach"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-[#5a6478] hover:text-white hover:bg-white/5'}`
            }
          >
            Coach
          </NavLink>
          <NavLink to="/player"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-[#5a6478] hover:text-white hover:bg-white/5'}`
            }
          >
            Joueur
          </NavLink>
        </nav>

        {isCoach && pattern && (
          <>
            <div className="w-px h-4 mx-1" style={{ background: '#1f2735' }} />
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{pattern.name}</span>
              <span
                className="px-2 py-0.5 rounded text-xs font-mono"
                style={{ background: '#06b6d422', color: '#06b6d4' }}
              >
                {pattern.phase}
              </span>
            </div>
          </>
        )}

        <div className="flex-1" />

        {isCoach && pattern && (
          <button
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold"
            style={{ background: '#06b6d422', border: '1px solid #06b6d4', color: '#06b6d4' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
            </svg>
            Enregistrer
          </button>
        )}
      </header>

      {/* Content */}
      <div className="flex flex-1 min-h-0">
        {isCoach && (
          <>
            {/* Sidebar: pattern list */}
            <aside className="w-72 shrink-0 flex flex-col overflow-hidden" style={{ borderRight: '1px solid #1f2735' }}>
              <PatternList />
            </aside>

            {/* Editor */}
            <main className="flex-1 min-w-0">
              <Routes>
                <Route path="/coach" element={
                  <div className="flex items-center justify-center h-full text-sm" style={{ color: '#5a6478' }}>
                    Sélectionne une situation dans le panneau gauche
                  </div>
                } />
                <Route path="/coach/:id" element={<CoachEditor />} />
              </Routes>
            </main>
          </>
        )}

        {isPlayer && (
          <main className="flex-1 min-h-0">
            <Routes>
              <Route path="/player" element={<PlayerHome />} />
              <Route path="/player/:id" element={<PlayerSession />} />
            </Routes>
          </main>
        )}
      </div>
    </div>
  )
}

// ─── Mobile shell ──────────────────────────────────────────────────────────────
function MobileShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const isCoach = location.pathname.startsWith('/coach')
  const pattern = usePatternStore((s) => s.activePattern())

  const showBackInEditor = location.pathname.match(/\/(coach|player)\/.+/)

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        width: '100%',
        height: '100svh',
        background: '#0a0e14',
      }}
    >
      {/* Topbar */}
      {!isHome && (
        <header
          className="flex items-center gap-2.5 px-3 py-2.5 shrink-0"
          style={{ borderBottom: '1px solid #1f2735', background: 'linear-gradient(180deg, #131a26 0%, #0a0e14 100%)' }}
        >
          {showBackInEditor ? (
            <button
              onClick={() => navigate(isCoach ? '/coach' : '/player')}
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: '#181f2c', border: '1px solid #1f2735' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: '#181f2c', border: '1px solid #1f2735' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isCoach ? '#06b6d4' : '#fbbf24', boxShadow: `0 0 6px ${isCoach ? '#06b6d4' : '#fbbf24'}` }} />
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#5a6478' }}>
                {isCoach ? 'Coach' : 'Joueur'}
              </span>
            </div>
            <div className="text-sm font-semibold leading-tight truncate mt-0.5">
              {pattern && showBackInEditor ? pattern.name : isCoach ? 'Situations' : 'Entraînement'}
            </div>
          </div>

          {isCoach && pattern && showBackInEditor && (
            <button
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg font-semibold text-xs shrink-0"
              style={{ background: '#06b6d422', border: '1px solid #06b6d4', color: '#06b6d4' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
              </svg>
              Sauv.
            </button>
          )}
        </header>
      )}

      <main className="flex-1 min-h-0">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/coach" element={<PatternList />} />
          <Route path="/coach/:id" element={<CoachEditor />} />
          <Route path="/player" element={<PlayerHome />} />
          <Route path="/player/:id" element={<PlayerSession />} />
        </Routes>
      </main>
    </div>
  )
}

// ─── Root ───────────────────────────────────────────────────────────────────────
function AppInner() {
  const isDesktop = useIsDesktop()

  if (isDesktop) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/coach" replace />} />
        <Route path="/*" element={<DesktopShell />} />
      </Routes>
    )
  }

  return <MobileShell />
}

export function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}

export default App
