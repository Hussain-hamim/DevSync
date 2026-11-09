import type { ReactNode } from "react";

const ink = "rgba(255,255,255,0.18)"
const teal = "#14b8a6"
const tealSoft = "rgba(20,184,166,0.28)"
const panel = "#081412"

function DiagramFrame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 200 110" style={{ width: "100%", height: "auto", display: "block" }} aria-hidden>
      <rect x="8" y="8" width="184" height="94" rx="10" fill={panel} stroke="rgba(255,255,255,0.08)" />
      {children}
    </svg>
  )
}

/** Scattered threads from five sources funnel into one inbox. */

/** Many comments collapse into a few theme stacks. */

/** Ranked demand bars — top row is the honest yes. */

/** Competitor grid with one open wedge. */
function DiagramGaps() {
  return (
    <DiagramFrame>
      <rect x="28" y="24" width="40" height="28" rx="4" fill="none" stroke={ink} />
      <rect x="80" y="24" width="40" height="28" rx="4" fill="none" stroke={ink} />
      <rect x="132" y="24" width="40" height="28" rx="4" fill="none" stroke={ink} />
      <rect x="28" y="62" width="40" height="28" rx="4" fill="none" stroke={ink} />
      <rect x="80" y="62" width="40" height="28" rx="4" fill={tealSoft} stroke={teal} strokeDasharray="4 3" />
      <text x="87" y="80" fill={teal} fontSize="9" fontFamily="ui-monospace, monospace">build</text>
      <rect x="132" y="62" width="40" height="28" rx="4" fill="none" stroke={ink} />
    </DiagramFrame>
  )
}

/** Pricing shape — willingness-to-pay as a rising curve. */

/** Live scan — ticks keep arriving on a timeline. */

function DiagramSources() {
  return (
    <DiagramFrame>
      <circle cx="100" cy="55" r="16" fill={tealSoft} stroke={teal} />
      <circle cx="100" cy="55" r="5" fill={teal} />
      <circle cx="48" cy="32" r="8" fill="none" stroke={ink} />
      <circle cx="152" cy="32" r="8" fill="none" stroke={ink} />
      <circle cx="40" cy="78" r="8" fill="none" stroke={ink} />
      <circle cx="160" cy="78" r="8" fill="none" stroke={ink} />
      <circle cx="100" cy="22" r="8" fill="none" stroke={ink} />
      <path d="M56 36l28 12M144 36l-28 12M48 72l36-10M152 72l-36-10M100 30v10" stroke={ink} />
    </DiagramFrame>
  )
}


function DiagramVerdict() {
  return (
    <DiagramFrame>
      <rect x="30" y="28" width="36" height="22" rx="4" fill="none" stroke={ink} />
      <rect x="30" y="58" width="36" height="22" rx="4" fill="none" stroke={ink} />
      <rect x="78" y="28" width="36" height="22" rx="4" fill="none" stroke={ink} />
      <rect x="78" y="58" width="36" height="22" rx="4" fill="none" stroke={ink} />
      <path d="M66 39h12M66 69h12M96 50v8" stroke={ink} />
      <rect x="128" y="34" width="44" height="42" rx="6" fill={tealSoft} stroke={teal} />
      <path d="M140 56l8 8 16-16" fill="none" stroke={teal} strokeWidth="2" strokeLinecap="round" />
    </DiagramFrame>
  )
}


export { DiagramGaps as ProjectIllustration, DiagramSources as TeamIllustration, DiagramVerdict as ContributionIllustration };

function DiagramCluster() {
  return (
    <DiagramFrame>
      {[
        [28, 28], [40, 22], [36, 40], [52, 34],
        [30, 72], [44, 80], [38, 64],
        [70, 50], [82, 44], [78, 62], [90, 54],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="8" height="6" rx="1.5" fill={ink} opacity={0.7} />
      ))}
      <path d="M96 40c18-18 28-10 36 8" fill="none" stroke={ink} strokeDasharray="3 3" />
      <path d="M96 70c16 16 28 8 36-8" fill="none" stroke={ink} strokeDasharray="3 3" />
      <rect x="132" y="24" width="40" height="10" rx="3" fill={teal} />
      <rect x="132" y="40" width="32" height="10" rx="3" fill={tealSoft} stroke={teal} />
      <rect x="132" y="56" width="24" height="10" rx="3" fill="none" stroke={ink} />
      <rect x="132" y="72" width="18" height="10" rx="3" fill="none" stroke={ink} />
    </DiagramFrame>
  )
}

function DiagramListen() {
  return (
    <DiagramFrame>
      <circle cx="32" cy="32" r="7" fill="none" stroke={ink} />
      <circle cx="32" cy="55" r="7" fill="none" stroke={ink} />
      <circle cx="32" cy="78" r="7" fill="none" stroke={ink} />
      <circle cx="58" cy="42" r="6" fill="none" stroke={ink} />
      <circle cx="58" cy="68" r="6" fill="none" stroke={ink} />
      <path d="M40 32h18c18 0 28 12 48 23" fill="none" stroke={ink} strokeWidth="1.2" />
      <path d="M40 55h22c12 0 22 0 44 0" fill="none" stroke={teal} strokeWidth="1.6" />
      <path d="M40 78h18c18 0 28-12 48-23" fill="none" stroke={ink} strokeWidth="1.2" />
      <path d="M64 42h12c10 0 18 8 28 13" fill="none" stroke={ink} strokeWidth="1.1" />
      <path d="M64 68h12c10 0 18-8 28-13" fill="none" stroke={ink} strokeWidth="1.1" />
      <rect x="128" y="38" width="48" height="34" rx="7" fill={tealSoft} stroke={teal} />
      <path d="M140 52h24M140 62h16" stroke={teal} strokeWidth="1.5" strokeLinecap="round" />
    </DiagramFrame>
  )
}

function DiagramLive() {
  return (
    <DiagramFrame>
      <path d="M24 55h152" stroke={ink} />
      {[40, 70, 100, 130, 160].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="50" x2={x} y2="60" stroke={i === 4 ? teal : ink} />
          {i > 1 && <circle cx={x} cy="40" r={i === 4 ? 5 : 3.5} fill={i === 4 ? teal : tealSoft} />}
        </g>
      ))}
      <path d="M100 40h30" stroke={teal} strokeWidth="1.2" />
      <path d="M130 40h30" stroke={teal} strokeWidth="1.2" />
      <rect x="148" y="68" width="28" height="14" rx="7" fill={tealSoft} stroke={teal} />
      <text x="154" y="78" fill={teal} fontSize="8" fontFamily="ui-monospace, monospace">now</text>
    </DiagramFrame>
  )
}

export { DiagramCluster as DiscoverIllustration, DiagramListen as ConnectIllustration, DiagramLive as ContributeIllustration };
