function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12.5l5 5 11-12" stroke="#3a2b00" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Seal({ large = false, label = 'Verified' }) {
  return (
    <span className={'seal' + (large ? ' seal--lg' : '')} title="Verified by LuxeKeys">
      <span className="seal__disc">
        <Check />
      </span>
      {label}
    </span>
  )
}

export function Pending() {
  return (
    <span className="pending" title="Awaiting LuxeKeys verification">
      <span className="dot" /> Pending verification
    </span>
  )
}
