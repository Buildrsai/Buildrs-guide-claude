import { useState } from 'react'

type Step = 1 | 2 | 3 | 'done'

const OBJECTIVES = [
  { icon: '⚡', label: 'Créer un Micro-SaaS / produit IA', sub: 'Construire un actif logiciel avec l\'IA' },
  { icon: '🔧', label: 'Automatiser mon travail quotidien', sub: 'Gagner du temps sur des tâches répétitives' },
  { icon: '📈', label: 'Booster mon business existant', sub: 'Marketing, contenu, service client IA' },
  { icon: '🎯', label: 'Explorer et comprendre l\'IA', sub: 'Pas encore de projet précis, je découvre' },
]

const LEVELS = [
  { icon: '🌱', label: 'Débutant' },
  { icon: '👀', label: 'Je teste' },
  { icon: '⚡', label: 'J\'utilise' },
  { icon: '🚀', label: 'Je maîtrise' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1)
  const [selectedObjective, setSelectedObjective] = useState<number | null>(0)
  const [projectDesc, setProjectDesc] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<number | null>(1)

  const progressDots = [1, 2, 3]

  if (step === 'done') {
    return (
      <div style={pageStyle}>
        <div style={glowStyle} />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '44px', height: '44px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Claude_AI_symbol.svg" style={{ width: '36px', height: '36px', opacity: 0.7 }} alt="Claude" />
          </div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '24px', color: '#EDEEEF', marginBottom: '8px' }}>
            Ton guide est prêt
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(237,238,239,0.35)', lineHeight: 1.6 }}>
            Personnalisé selon ton profil.<br />12 chapitres, résultats immédiats.
          </div>
          <div style={{ marginTop: '24px', display: 'flex', gap: '6px', justifyContent: 'center' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(237,238,239,0.4)' }} />
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(237,238,239,0.2)' }} />
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(237,238,239,0.1)' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={glowStyle} />

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', justifyContent: 'center' }}>
          {progressDots.map((dot) => (
            <div
              key={dot}
              style={{
                height: '3px',
                width: '48px',
                borderRadius: '99px',
                background:
                  dot < step
                    ? 'rgba(255,255,255,0.5)'
                    : dot === step
                    ? '#EDEEEF'
                    : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Step 1 — Objective */}
        {step === 1 && (
          <>
            <div style={eyebrowStyle}>Question 1 / 3</div>
            <h2 style={questionTitleStyle}>Tu veux utiliser Claude<br />pour quoi, principalement ?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
              {OBJECTIVES.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedObjective(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 16px',
                    background: selectedObjective === i ? '#111214' : '#0C0D0E',
                    border: `1px solid ${selectedObjective === i ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                    {opt.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#EDEEEF', marginBottom: '2px' }}>{opt.label}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(237,238,239,0.4)', lineHeight: 1.4 }}>{opt.sub}</div>
                  </div>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    border: `1.5px solid ${selectedObjective === i ? '#EDEEEF' : 'rgba(255,255,255,0.15)'}`,
                    background: selectedObjective === i ? '#EDEEEF' : 'transparent',
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selectedObjective === i && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#080909' }} />}
                  </div>
                </div>
              ))}
            </div>
            <div style={navStyle}>
              <button onClick={() => setStep(2)} style={skipBtnStyle}>Passer</button>
              <button onClick={() => setStep(2)} style={nextBtnStyle}>
                Continuer
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </>
        )}

        {/* Step 2 — Project description */}
        {step === 2 && (
          <>
            <div style={eyebrowStyle}>Question 2 / 3</div>
            <h2 style={questionTitleStyle}>Si tu as un projet ou<br />une idée, décris-le</h2>
            <textarea
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value.slice(0, 200))}
              placeholder="Ex : un outil IA pour aider les freelances à rédiger leurs propositions commerciales..."
              style={{
                width: '100%',
                background: '#0C0D0E',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '10px',
                padding: '14px 16px',
                fontSize: '14px',
                color: 'rgba(237,238,239,0.7)',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'none',
                height: '96px',
                lineHeight: 1.6,
                marginBottom: '10px',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ fontSize: '11px', color: 'rgba(237,238,239,0.2)', textAlign: 'right', marginBottom: '32px' }}>
              {projectDesc.length} / 200
            </div>
            <div style={navStyle}>
              <button onClick={() => setStep(3)} style={skipBtnStyle}>Passer</button>
              <button onClick={() => setStep(3)} style={nextBtnStyle}>
                Continuer
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </>
        )}

        {/* Step 3 — Tech level */}
        {step === 3 && (
          <>
            <div style={eyebrowStyle}>Question 3 / 3</div>
            <h2 style={questionTitleStyle}>Ton niveau avec<br />l'IA et le VibeCoding ?</h2>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
              {LEVELS.map((lvl, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedLevel(i)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    background: selectedLevel === i ? '#111214' : '#0C0D0E',
                    border: `1px solid ${selectedLevel === i ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: selectedLevel === i ? '#EDEEEF' : 'rgba(237,238,239,0.4)',
                    fontWeight: selectedLevel === i ? 500 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>{lvl.icon}</div>
                  <div>{lvl.label}</div>
                </div>
              ))}
            </div>
            <div style={navStyle}>
              <button onClick={() => setStep('done')} style={skipBtnStyle}>Passer</button>
              <button onClick={() => setStep('done')} style={nextBtnStyle}>
                Accéder au guide
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  background: '#080909',
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
  backgroundSize: '28px 28px',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 24px',
  fontFamily: "'Geist', sans-serif",
  color: '#EDEEEF',
  position: 'relative',
}

const glowStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '400px',
  height: '200px',
  background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 70%)',
  pointerEvents: 'none',
}

const eyebrowStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(237,238,239,0.3)',
  marginBottom: '10px',
  textAlign: 'center',
}

const questionTitleStyle: React.CSSProperties = {
  fontFamily: "'Geist', sans-serif",
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: '26px',
  color: '#EDEEEF',
  textAlign: 'center',
  marginBottom: '32px',
  letterSpacing: '-0.04em',
  lineHeight: 1.2,
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const skipBtnStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(237,238,239,0.25)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const nextBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  background: '#EDEEEF',
  color: '#080909',
  fontSize: '13px',
  fontWeight: 600,
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
