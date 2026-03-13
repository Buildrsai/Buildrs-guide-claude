import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {
  Button,
  Card,
  Input,
  Badge,
  Divider,
} from '@/components/ui'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import CtaFinalPage from './pages/CtaFinalPage'

function DesignSystemPage() {
  return (
    <div className="dots-bg relative min-h-screen bg-bg-base">
      {/* Ambient glow */}
      <div className="ambient-glow fixed inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-[960px] mx-auto px-6 py-16 space-y-16">

        {/* HERO */}
        <section className="text-center space-y-4">
          <p className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-text-muted">
            Design System · Phase 1
          </p>
          <h1 className="font-display italic text-5xl text-text-primary leading-none tracking-[-0.05em]">
            Buildrs
          </h1>
          <p className="font-sans text-text-secondary text-base max-w-md mx-auto">
            Le Laboratoire des Builders SaaS IA
          </p>
        </section>

        <Divider />

        {/* BUTTONS */}
        <section className="space-y-6">
          <p className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-text-muted">
            Boutons
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary">Commencer</Button>
            <Button variant="secondary">Voir les offres</Button>
            <Button variant="ghost">En savoir plus</Button>
            <Button variant="primary" disabled>Désactivé</Button>
            <Button variant="primary" size="sm">Petit</Button>
            <Button variant="primary" size="lg">Grand</Button>
          </div>
        </section>

        <Divider />

        {/* CARDS */}
        <section className="space-y-6">
          <p className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-text-muted">
            Cards
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-sans font-medium text-sm text-text-primary">AI Business Matcher</p>
                <Badge variant="success">Live</Badge>
              </div>
              <p className="font-sans text-sm text-text-secondary">
                Trouve le business modèle SaaS IA qui correspond à ton profil, ton budget et tes objectifs en 5 questions.
              </p>
            </Card>
            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-sans font-medium text-sm text-text-primary">Idea Validator</p>
                <Badge>Bientôt</Badge>
              </div>
              <p className="font-sans text-sm text-text-secondary">
                Valide ton idée de Micro-SaaS en 30 secondes — score, marché, ICP, canal d'acquisition, verdict.
              </p>
            </Card>
          </div>
        </section>

        <Divider />

        {/* INPUTS */}
        <section className="space-y-6">
          <p className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-text-muted">
            Inputs
          </p>
          <div className="max-w-sm space-y-3">
            <Input placeholder="Décris ton idée de Micro-SaaS..." />
            <Input placeholder="ton@email.com" type="email" />
            <Input placeholder="Champ désactivé" disabled />
          </div>
        </section>

        <Divider />

        {/* BADGES */}
        <section className="space-y-6">
          <p className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-text-muted">
            Badges
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge>Free</Badge>
            <Badge variant="success">Actif</Badge>
            <Badge variant="warning">En attente</Badge>
            <Badge variant="error">Échoué</Badge>
          </div>
        </section>

      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DesignSystemPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cta" element={<CtaFinalPage />} />
      </Routes>
    </BrowserRouter>
  )
}
