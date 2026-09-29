import React, { useState } from 'react';
import { Shield, Github, Menu, X, ArrowRight, ExternalLink } from 'lucide-react';

interface NavbarProps {
  onOpenInstallModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenInstallModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <a href="#" className="nav-brand">
          <div className="brand-logo-glow">
            <Shield size={22} className="brand-icon" />
          </div>
          <span className="brand-title">
            Project<span className="accent-text">Lens</span>
          </span>
          <span className="nav-badge">v0.1.0 • Manifest V3</span>
        </a>

        {/* Desktop Links */}
        <nav className="nav-links">
          <a href="#simulador" className="nav-link">Simulador ao Vivo</a>
          <a href="#modulos" className="nav-link">Módulos</a>
          <a href="#metodologia" className="nav-link">Cadeia SHA-256</a>
          <a href="#para-quem" className="nav-link">Para Quem É</a>
          <a href="#comparativo" className="nav-link">Comparativo</a>
          <a href="#faq" className="nav-link">FAQ</a>
        </nav>

        {/* Action Buttons */}
        <div className="nav-actions">
          <a 
            href="https://github.com/leonardoferreira21/ProjectLens" 
            target="_blank" 
            rel="noreferrer" 
            className="btn-github"
            title="Ver código no GitHub"
          >
            <Github size={17} />
            <span>GitHub</span>
          </a>

          <button 
            className="btn-nav-primary"
            onClick={onOpenInstallModal}
          >
            <span>Instalar Extensão</span>
            <ArrowRight size={15} />
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="btn-mobile-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <a href="#simulador" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Simulador ao Vivo</a>
          <a href="#modulos" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Módulos Técnicos</a>
          <a href="#metodologia" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Cadeia SHA-256</a>
          <a href="#para-quem" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Para Quem É</a>
          <a href="#comparativo" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Comparativo</a>
          <a href="#faq" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Perguntas Frequentes</a>
          <div className="mobile-drawer-actions">
            <button 
              className="btn-nav-primary w-full"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInstallModal();
              }}
            >
              <span>Instalar Extensão</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
