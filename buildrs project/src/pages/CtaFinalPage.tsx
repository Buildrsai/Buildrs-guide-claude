const CARDS = [
  {
    label: 'Buildrs Academy',
    badge: { text: 'Entrée', style: { background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)', color: 'rgba(74,222,128,0.7)' } },
    title: 'Guide\nVibeCoder',
    price: '17€',
    priceUnit: 'one-shot',
    priceStrike: null,
    features: [
      { text: 'Méthode VibeCoding pas à pas', check: true },
      { text: 'Les 3 stratégies Buildrs expliquées', check: true },
      { text: 'Prompts essentiels prêts à copier', check: true },
      { text: 'Générateurs IA non inclus', check: false },
    ],
    cta: 'Accéder — 17€ →',
    ctaPrimary: false,
    featured: false,
  },
  {
    label: 'Buildrs Academy',
    badge: { text: 'Recommandé', style: { background: 'rgba(232,232,232,0.08)', border: '1px solid rgba(232,232,232,0.15)', color: 'rgba(237,238,239,0.6)' } },
    title: 'Guide VibeCoder\nComplet',
    price: '97€',
    priceUnit: 'one-shot',
    priceStrike: '147€',
    features: [
      { text: 'Tout le Guide VibeCoder', check: true },
      { text: 'Plan complet idée → MRR → Exit', check: true },
      { text: 'Générateurs IA illimités (5 outils)', check: true },
      { text: 'Accès Discord communauté builders', check: true },
    ],
    cta: 'Accéder au Guide — 97€ →',
    ctaPrimary: true,
    featured: true,
  },
  {
    label: 'Buildrs Lab',
    badge: { text: 'Live', style: { background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', color: 'rgba(251,191,36,0.7)' } },
    title: 'Installation Claude\nPersonnalisée 1:1',
    price: '297€',
    priceUnit: 'one-shot',
    priceUnit2: '8h live visio',
    priceStrike: null,
    features: [
      { text: 'Setup complet Claude Code + MCP', check: true },
      { text: 'CLAUDE.md sur mesure pour ton projet', check: true },
      { text: '8h de visio en live avec Alfred', check: true },
      { text: 'Tu restes sur Zoom jusqu\'à ce que ça tourne', check: true },
    ],
    cta: 'Réserver une session →',
    ctaPrimary: false,
    featured: false,
  },
] as const

export default function CtaFinalPage() {
  return (
    <div style={{ background: '#080909', color: '#EDEEEF', fontFamily: "'Geist', sans-serif", minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Topbar */}
      <div style={{ height: '48px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '10px', background: 'rgba(8,9,9,0.9)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Claude_AI_symbol.svg" alt="Claude" style={{ width: '22px', height: '22px' }} />
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#EDEEEF', letterSpacing: '-0.02em' }}>Guide Claude</span>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(237,238,239,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', padding: '2px 6px' }}>BY BUILDRS</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(74,222,128,0.9)', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '20px', padding: '3px 10px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(74,222,128,0.9)' }} />
            12 / 12 chapitres
          </div>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'rgba(237,238,239,0.7)' }}>A</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar — all done */}
        <div style={{ width: '240px', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px 0', flexShrink: 0, background: 'rgba(8,9,9,0.6)', overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(237,238,239,0.25)', padding: '0 16px', marginBottom: '8px' }}>Chapitres</div>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
            <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 16px', fontSize: '12px', color: 'rgba(237,238,239,0.45)' }}>
              <span style={{ fontSize: '11px', color: 'rgba(237,238,239,0.2)', fontFamily: "'Geist Mono', monospace", width: '20px', flexShrink: 0 }}>{String(num).padStart(2, '0')}</span>
              <span style={{ flex: 1 }}>Chapitre {num}</span>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4L3.5 6L6.5 2" stroke="rgba(74,222,128,0.8)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          ))}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 16px', fontSize: '12px', color: 'rgba(237,238,239,0.45)' }}>
            <span style={{ fontSize: '11px', color: 'rgba(237,238,239,0.2)', width: '20px', flexShrink: 0 }}>·</span>
            <span style={{ flex: 1 }}>Templates &amp; Prompts prêts à l'emploi</span>
            <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.7)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '3px', padding: '1px 5px' }}>BONUS</span>
          </div>
        </div>

        {/* Main CTA content */}
        <div style={{ flex: 1, padding: '48px 64px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#080909', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>

          {/* Achievement banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '8px', padding: '10px 16px', marginBottom: '40px', fontSize: '12px', color: 'rgba(74,222,128,0.8)', fontWeight: 500 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L8.8 5.1L13.3 5.5L10 8.4L11 12.8L7 10.4L3 12.8L4 8.4L0.7 5.5L5.2 5.1L7 1Z" fill="rgba(74,222,128,0.7)" />
            </svg>
            Guide complété — 12 chapitres terminés
          </div>

          {/* Title */}
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(237,238,239,0.3)', marginBottom: '16px', textAlign: 'center' }}>
            Et maintenant ?
          </p>
          <h1 style={{ fontFamily: "'Geist', sans-serif", fontSize: '48px', fontWeight: 400, color: '#EDEEEF', lineHeight: 1.05, letterSpacing: '-0.05em', textAlign: 'center', marginBottom: '18px', maxWidth: '560px' }}>
            Tu sais.<br />
            <span style={{ color: 'rgba(237,238,239,0.28)' }}>Maintenant, construis.</span>
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(237,238,239,0.5)', lineHeight: 1.65, textAlign: 'center', maxWidth: '480px', marginBottom: '48px' }}>
            Tu as les bases. La prochaine étape, c'est passer à l'action — avec un plan complet, les bons outils, et un accès direct à Alfred si tu veux aller vite.
          </p>

          {/* Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', width: '100%', maxWidth: '860px', marginBottom: '32px' }}>
            {CARDS.map((card, i) => (
              <div
                key={i}
                style={{
                  background: card.featured ? 'linear-gradient(160deg, #0F1011 0%, #0C0D0E 100%)' : '#0C0D0E',
                  border: `1px solid ${card.featured ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.10)'}`,
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative',
                }}
              >
                {/* Label row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(237,238,239,0.3)' }}>{card.label}</span>
                  <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: '4px', padding: '2px 7px', ...card.badge.style }}>{card.badge.text}</span>
                </div>

                {/* Title */}
                <div style={{ fontFamily: "'Geist', sans-serif", fontSize: '18px', fontWeight: 500, color: '#EDEEEF', letterSpacing: '-0.03em', lineHeight: 1.3 }}>
                  {card.title.split('\n').map((line, j) => (
                    <span key={j}>{line}{j < card.title.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 600, color: '#EDEEEF', letterSpacing: '-0.04em', lineHeight: 1 }}>{card.price}</span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '1px', lineHeight: 1.3 }}>
                    <span style={{ fontSize: '13px', color: 'rgba(237,238,239,0.35)' }}>{card.priceUnit}</span>
                    {'priceUnit2' in card && card.priceUnit2 && (
                      <span style={{ fontSize: '10px', color: 'rgba(237,238,239,0.25)' }}>{card.priceUnit2}</span>
                    )}
                  </span>
                  {card.priceStrike && (
                    <span style={{ fontSize: '14px', color: 'rgba(237,238,239,0.2)', textDecoration: 'line-through' }}>{card.priceStrike}</span>
                  )}
                </div>

                {/* Features */}
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {card.features.map((feat, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: feat.check ? 'rgba(237,238,239,0.55)' : 'rgba(237,238,239,0.25)', lineHeight: 1.4 }}>
                      <span style={{ color: feat.check ? 'rgba(74,222,128,0.7)' : 'rgba(237,238,239,0.25)', flexShrink: 0, marginTop: '1px' }}>
                        {feat.check ? '✓' : '–'}
                      </span>
                      {feat.text}
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <button
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    textAlign: 'center',
                    background: card.ctaPrimary ? '#EDEEEF' : 'transparent',
                    color: card.ctaPrimary ? '#080909' : 'rgba(237,238,239,0.65)',
                    border: card.ctaPrimary ? 'none' : '1px solid rgba(255,255,255,0.10)',
                    transition: 'opacity 0.15s',
                  }}
                >
                  {card.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div style={{ width: '100%', maxWidth: '860px', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', flexShrink: 0 }}>
              {['M', 'S', 'T', '+'].map((letter, i) => (
                <div key={i} style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '2px solid #080909', marginLeft: i === 0 ? 0 : '-8px', fontSize: '11px', fontWeight: 600, color: 'rgba(237,238,239,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {letter}
                </div>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(237,238,239,0.45)', lineHeight: 1.5 }}>
              <strong style={{ color: 'rgba(237,238,239,0.7)', fontWeight: 500 }}>+240 builders</strong> ont déjà commencé la méthode Buildrs — dont 18 avec un premier MRR en moins de 30 jours.
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
