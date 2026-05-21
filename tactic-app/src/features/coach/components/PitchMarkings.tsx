const S = 'rgba(255,255,255,0.42)'
const SW = 0.3

export function PitchMarkings() {
  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Mowing stripes */}
      {Array.from({ length: 6 }).map((_, i) => (
        <rect
          key={i}
          x="0"
          y={i * 10}
          width="68"
          height="10"
          fill={i % 2 === 0 ? 'rgba(255,255,255,0.022)' : 'rgba(0,0,0,0.05)'}
        />
      ))}

      {/* Outer border */}
      <rect x="0.5" y="0.5" width="67" height="59" fill="none" stroke={S} strokeWidth={SW} />

      {/* Goal (attacking, top) */}
      <rect x={(68 - 7.32) / 2} y="-0.5" width="7.32" height="0.8" fill={S} opacity="0.9" />

      {/* 6-yard box */}
      <rect x={(68 - 18.32) / 2} y="0.5" width="18.32" height="5.5" fill="none" stroke={S} strokeWidth={SW} />

      {/* Penalty area */}
      <rect x={(68 - 40.32) / 2} y="0.5" width="40.32" height="16.5" fill="none" stroke={S} strokeWidth={SW} />

      {/* Penalty spot */}
      <circle cx="34" cy="11" r="0.45" fill={S} />

      {/* Penalty arc */}
      <path d="M 26.69,16.5 A 9.15,9.15 0 0,0 41.31,16.5" fill="none" stroke={S} strokeWidth={SW} />

      {/* Halfway / defensive line */}
      <line x1="0.5" y1="55" x2="67.5" y2="55" stroke={S} strokeWidth={SW} />

      {/* Centre circle arc at halfway */}
      <path d={`M ${34 - 9.15},55 A 9.15,9.15 0 0,1 ${34 + 9.15},55`} fill="none" stroke={S} strokeWidth={SW} />
      <circle cx="34" cy="55" r="0.45" fill={S} />

      {/* Corner arcs */}
      <path d="M 0.5,53 A 2,2 0 0,0 2.5,55" fill="none" stroke={S} strokeWidth={SW} />
      <path d="M 65.5,55 A 2,2 0 0,0 67.5,53" fill="none" stroke={S} strokeWidth={SW} />

      {/* Vignette overlay */}
      <defs>
        <radialGradient id="pitch-vignette" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="68" height="60" fill="url(#pitch-vignette)" />
    </g>
  )
}
