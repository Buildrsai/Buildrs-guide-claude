import { useState } from 'react'

const CHAPTERS = [
  { num: '01', title: 'Tu n\'es pas un dev, tu es un orchestrateur' },
  { num: '02', title: 'Buildrs & le VibeCoding' },
  { num: '03', title: 'Comprendre Claude & Anthropic' },
  { num: '04', title: 'Les modèles Claude (Haiku / Sonnet / Opus)' },
  { num: '05', title: 'Claude.ai — projets, mémoire, interface' },
  { num: '06', title: 'Claude Code — l\'agent développeur' },
  { num: '07', title: 'CLAUDE.md — ton chef d\'orchestre' },
  { num: '08', title: 'Les Skills — étendre Claude' },
  { num: '09', title: 'Maîtriser le prompting' },
  { num: '10', title: 'MCP — connecter Claude au monde' },
  { num: '11', title: 'Tes premiers workflows IA' },
  { num: '12', title: 'Construire ton premier Micro-SaaS', isLast: true },
]

const CHAPTER_CONTENT: Record<number, { title: string; subtitle: string; body: string[] }> = {
  1: {
    title: 'Tu n\'es pas un dev, tu es un orchestrateur',
    subtitle: 'Le changement de mindset qui change tout',
    body: [
      'La plupart des gens pensent que créer un SaaS nécessite de savoir coder. C\'est faux. En 2026, l\'IA code pour toi. Ton rôle, c\'est de diriger.',
      'Un orchestrateur d\'IA, c\'est quelqu\'un qui sait poser les bonnes questions, donner les bons contextes, et corriger le cap quand l\'IA dévie. C\'est une compétence. Elle s\'apprend.',
      'Ne pas savoir coder n\'est pas un handicap. C\'est même un avantage : tu n\'as pas de biais techniques. Tu penses produit, pas implémentation.',
    ],
  },
  6: {
    title: 'Claude Code — l\'agent développeur',
    subtitle: 'L\'outil qui transforme des idées en code réel',
    body: [
      'Claude Code est un agent IA qui tourne dans ton terminal. Il lit tes fichiers, écrit du code, lance des tests, et corrige ses propres erreurs. En boucle.',
      'La différence avec ChatGPT ? Claude Code agit. Il ne suggère pas du code, il l\'écrit directement dans ton projet. Il a un contexte complet de ton codebase.',
      'Avec un bon CLAUDE.md, Claude Code devient un dev senior qui connaît parfaitement ton projet et ne dévie jamais de ta vision.',
    ],
  },
}

export default function DashboardPage() {
  const [activeChapter, setActiveChapter] = useState(1)
  const [completedChapters, setCompletedChapters] = useState<number[]>([])

  const content = CHAPTER_CONTENT[activeChapter] || {
    title: CHAPTERS[activeChapter - 1]?.title || '',
    subtitle: 'Chapitre en cours',
    body: ['Contenu de ce chapitre à venir. Continue ta progression.'],
  }

  const markDone = () => {
    if (!completedChapters.includes(activeChapter)) {
      setCompletedChapters([...completedChapters, activeChapter])
    }
    if (activeChapter < 12) setActiveChapter(activeChapter + 1)
  }

  const progress = `${completedChapters.length} / 12`

  return (
    <div style={{ background: '#080909', color: '#EDEEEF', fontFamily: "'Geist', sans-serif", fontSize: '14px', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Topbar */}
      <div style={{ height: '52px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#EDEEEF', letterSpacing: '-0.01em', textDecoration: 'none' }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Claude_AI_symbol.svg" alt="Claude" style={{ width: '20px', height: '20px' }} />
            <span>Guide Claude</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>|</span>
            <span style={{ fontWeight: 400, color: 'rgba(237,238,239,0.55)' }}>by Buildrs</span>
          </a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(74,222,128,0.9)', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '20px', padding: '3px 10px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(74,222,128,0.9)' }} />
            {progress} chapitres
          </div>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'rgba(237,238,239,0.7)' }}>
            A
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{ width: '240px', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px 0', flexShrink: 0, background: 'rgba(8,9,9,0.6)', overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(237,238,239,0.25)', padding: '0 16px', marginBottom: '8px' }}>
            Chapitres
          </div>

          {CHAPTERS.map((ch, i) => {
            const num = i + 1
            const isDone = completedChapters.includes(num)
            const isActive = activeChapter === num
            return (
              <div
                key={num}
                onClick={() => setActiveChapter(num)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '7px 16px',
                  fontSize: '12px',
                  color: isActive ? '#EDEEEF' : isDone ? 'rgba(237,238,239,0.45)' : 'rgba(237,238,239,0.35)',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ fontSize: '11px', color: 'rgba(237,238,239,0.2)', fontFamily: "'Geist Mono', monospace", width: '20px', flexShrink: 0 }}>{ch.num}</span>
                <span style={{ flex: 1 }}>{ch.title}</span>
                {isDone && (
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3.5 6L6.5 2" stroke="rgba(74,222,128,0.8)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 16px', fontSize: '12px', color: 'rgba(237,238,239,0.45)' }}>
            <span style={{ fontSize: '11px', color: 'rgba(237,238,239,0.2)', width: '20px', flexShrink: 0 }}>·</span>
            <span style={{ flex: 1 }}>Templates &amp; Prompts prêts à l'emploi</span>
            <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.7)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '3px', padding: '1px 5px', flexShrink: 0 }}>BONUS</span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '48px 64px', overflowY: 'auto', background: '#080909', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
          <div style={{ maxWidth: '680px' }}>

            {/* Chapter label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(237,238,239,0.25)' }}>
                Chapitre {String(activeChapter).padStart(2, '0')}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.06), transparent)' }} />
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: "'Geist', sans-serif", fontSize: '32px', fontWeight: 400, color: '#EDEEEF', letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: '8px' }}>
              {content.title}
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(237,238,239,0.4)', marginBottom: '40px' }}>
              {content.subtitle}
            </p>

            {/* Body */}
            {content.body.map((para, i) => (
              <p key={i} style={{ fontSize: '15px', color: 'rgba(237,238,239,0.7)', lineHeight: 1.8, marginBottom: '20px' }}>
                {para}
              </p>
            ))}

            {/* Next button */}
            <div style={{ marginTop: '48px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={markDone}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#EDEEEF', color: '#080909', fontSize: '13px', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {activeChapter < 12 ? 'Chapitre suivant' : 'Terminer le guide'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
              {!completedChapters.includes(activeChapter) && (
                <button onClick={() => setCompletedChapters([...completedChapters, activeChapter])} style={{ fontSize: '12px', color: 'rgba(237,238,239,0.25)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Marquer comme lu
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
