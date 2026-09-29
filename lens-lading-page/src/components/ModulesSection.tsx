import React from 'react';
import { 
  Cookie, 
  ShieldCheck, 
  Globe, 
  Lock, 
  Database, 
  Binary,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const ModulesSection: React.FC = () => {
  const modules = [
    {
      icon: ShieldCheck,
      color: 'text-cyan',
      title: 'Consentimento & CMPs',
      subtitle: 'Content Script no DOM da Página',
      description: 'Detecta automaticamente banners de CMPs (OneTrust, Cookiebot, Didomi e outros). Captura ações de Aceitar, Rejeitar ou Customizar e compara o comportamento pré e pós-escolha.',
      features: [
        'Identificação de seletores de CMP populares',
        'Registro temporal de cliques de consentimento',
        'Verificação de respeito à escolha do usuário'
      ]
    },
    {
      icon: Cookie,
      color: 'text-amber',
      title: 'Auditoria de Cookies',
      subtitle: 'chrome.cookies API Snapshot & Listeners',
      description: 'Coleta o catálogo completo de cookies ativos no domínio e monitora criação e mutação em tempo real através de eventos do navegador.',
      features: [
        'Análise de flags: Secure, HttpOnly, SameSite',
        'Cálculo de persistência e expiração',
        'Diferenciação clara: before_consent vs after_consent'
      ]
    },
    {
      icon: Globe,
      color: 'text-sky',
      title: 'Rede & Terceiros',
      subtitle: 'chrome.webRequest & Identificação de Trackers',
      description: 'Mapeia requisições disparadas para parceiros externos, pixels de mídia, session replays e scripts que podem vazar dados de navegação.',
      features: [
        'Mapeamento de domínios third-party',
        'Detecção de scripts de rastreamento e analytics',
        'Associação entre momento do consentimento e disparo de tags'
      ]
    },
    {
      icon: Lock,
      color: 'text-emerald',
      title: 'Cabeçalhos HTTP de Segurança',
      subtitle: 'Inspeção de Headers da Resposta Principal',
      description: 'Verifica a presença e eficácia dos cabeçalhos recomendados por órgãos de segurança e pela ANPD para proteger os titulares.',
      features: [
        'Content-Security-Policy (CSP) contra injeções',
        'Strict-Transport-Security (HSTS) e HTTPS forçado',
        'X-Content-Type-Options e Referrer-Policy'
      ]
    },
    {
      icon: Database,
      color: 'text-purple',
      title: 'Web Storage Inspector',
      subtitle: 'localStorage & sessionStorage',
      description: 'Descobre identificadores persistentes e trackers gravados silenciosamente no armazenamento local do navegador para contornar bloqueios de cookies.',
      features: [
        'Tamanho em bytes e contagem de chaves',
        'Rastreamento de GUIDs e tokens persistentes',
        'Snapshot instantâneo sincronizado com a sessão'
      ]
    },
    {
      icon: Binary,
      color: 'text-rose',
      title: 'Cadeia de Hashes SHA-256',
      subtitle: 'Web Crypto API Nativa',
      description: 'Aplica criptografia determinística para selar cada evidência coletada em uma cadeia inviolável com verificação instantânea.',
      features: [
        'Canonicalização de JSON (chaves ordenadas)',
        'Vínculo estrito com previous_hash',
        'Verificador visual de integridade no Side Panel'
      ]
    }
  ];

  return (
    <section id="modulos" className="modules-section">
      <div className="section-header">
        <div className="section-badge">
          <Layers size={14} />
          <span>Módulos de Inspeção</span>
        </div>
        <h2 className="section-title">
          Visão 360º de Privacidade e Segurança
        </h2>
        <p className="section-subtitle">
          Uma arquitetura modular construída sobre o Google Chrome Manifest V3,
          projetada para cobrir todos os pontos de contato da página com o usuário.
        </p>
      </div>

      <div className="modules-grid">
        {modules.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="module-card">
              <div className="module-card-header">
                <div className={`module-icon-box ${m.color}`}>
                  <Icon size={24} />
                </div>
                <div className="module-header-text">
                  <h3 className="module-title">{m.title}</h3>
                  <span className="module-subtitle">{m.subtitle}</span>
                </div>
              </div>

              <p className="module-description">{m.description}</p>

              <div className="module-features-list">
                {m.features.map((f, fIdx) => (
                  <div key={fIdx} className="feature-item">
                    <span className="feature-bullet">•</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
