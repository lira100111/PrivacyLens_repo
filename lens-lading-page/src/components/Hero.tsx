import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Terminal, 
  Lock, 
  Play, 
  Download, 
  ArrowRight,
  Database,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface HeroProps {
  onOpenInstallModal: () => void;
  onScrollToSimulator: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenInstallModal, onScrollToSimulator }) => {
  return (
    <section className="hero-section">
      <div className="hero-glow-bg"></div>
      <div className="hero-grid-pattern"></div>

      <div className="hero-container">
        {/* Eyebrow tag */}
        <div className="hero-eyebrow">
          <span className="eyebrow-dot"></span>
          <span className="eyebrow-text">Chrome Extension • Manifest V3 • React 19</span>
          <span className="eyebrow-badge">Open Source</span>
        </div>

        {/* Headline */}
        <h1 className="hero-title">
          Auditoria Técnica de <br className="hidden-sm" />
          <span className="gradient-text">Privacidade, Segurança e LGPD</span> <br className="hidden-sm" />
          Direto no seu Navegador
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Observe o comportamento real da página, detecte cookies antes e depois do consentimento,
          rastreie requisições de terceiros e gere dossiês com <strong>cadeia de hashes SHA-256 imutável</strong>.
          Tudo 100% local, com <strong>zero telemetria externa</strong>.
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta-group">
          <button className="btn-hero-primary" onClick={onOpenInstallModal}>
            <Download size={18} />
            <span>Instalar Extensão Gratuitamente</span>
            <ArrowRight size={16} />
          </button>

          <button className="btn-hero-secondary" onClick={onScrollToSimulator}>
            <Play size={16} className="play-icon" />
            <span>Experimentar Simulador ao Vivo</span>
          </button>
        </div>

        {/* Trust & Spec Badges */}
        <div className="hero-metrics-bar">
          <div className="metric-pill">
            <ShieldCheck size={18} className="pill-icon text-emerald" />
            <div className="pill-content">
              <strong>100% Local</strong>
              <span>Zero dados enviados para servidores</span>
            </div>
          </div>

          <div className="metric-pill">
            <Lock size={18} className="pill-icon text-cyan" />
            <div className="pill-content">
              <strong>Cadeia SHA-256</strong>
              <span>Evidências criptografadas e auditáveis</span>
            </div>
          </div>

          <div className="metric-pill">
            <CheckCircle2 size={18} className="pill-icon text-sky" />
            <div className="pill-content">
              <strong>Fatos Observáveis</strong>
              <span>Separação entre evidência técnica e direito</span>
            </div>
          </div>

          <div className="metric-pill">
            <Cpu size={18} className="pill-icon text-indigo" />
            <div className="pill-content">
              <strong>Side Panel Nativo</strong>
              <span>Interface lateral contínua sem fechar o DOM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
