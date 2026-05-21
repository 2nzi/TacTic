import { useNavigate } from 'react-router'

export function HomeScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full" style={{ background: '#06080c' }}>
      {/* Header */}
      <div className="flex items-center justify-center pt-12 pb-8 shrink-0">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4', boxShadow: '0 0 10px #06b6d4' }} />
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#5a6478' }}>
              TacTic
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Tactical Learning</h1>
          <p className="text-sm mt-1" style={{ color: '#5a6478' }}>Choisissez votre mode</p>
        </div>
      </div>

      {/* Role cards */}
      <div className="flex flex-col gap-4 px-6 flex-1">
        {/* Coach card */}
        <button
          onClick={() => navigate('/coach')}
          className="flex-1 flex flex-col items-start justify-between p-5 rounded-2xl text-left transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #131a26 0%, #0d1220 100%)',
            border: '1px solid #1f2735',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: '#06b6d422', border: '1px solid #06b6d444' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <div className="text-lg font-bold mb-1">Mode Coach</div>
            <div className="text-sm" style={{ color: '#8b96a8' }}>
              Crée et gère des patterns tactiques. Place les joueurs, définis les trajectoires et les moments clés.
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4" style={{ color: '#06b6d4' }}>
            <span className="text-sm font-medium">Accéder</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>

        {/* Player card */}
        <button
          onClick={() => navigate('/player')}
          className="flex-1 flex flex-col items-start justify-between p-5 rounded-2xl text-left transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #1a1306 0%, #120e04 100%)',
            border: '1px solid #2a1f05',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: '#fbbf2422', border: '1px solid #fbbf2444' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="#fbbf24" stroke="none" />
              </svg>
            </div>
            <div className="text-lg font-bold mb-1">Mode Joueur</div>
            <div className="text-sm" style={{ color: '#8b96a8' }}>
              Entraîne-toi sur les situations tactiques. Visualise, mémorise et dessine les trajectoires.
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4" style={{ color: '#fbbf24' }}>
            <span className="text-sm font-medium">Accéder</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>
      </div>

      <div className="pb-8" />
    </div>
  )
}
