import React from 'react';
import { 
  Users, 
  Briefcase, 
  Code2, 
  Scale, 
  SearchCheck,
  Check
} from 'lucide-react';

export const TargetAudience: React.FC = () => {
  const audiences = [
    {
      icon: Briefcase,
      role: 'DPOs e Consultores de Privacidade',
      tagline: 'Evidências concretas para RIPD e Auditorias',
      benefits: [
        'Documentação técnica para Relatórios de Impacto à Proteção de Dados (RIPD)',
        'Auditoria do cumprimento real das diretrizes da ANPD',
        'Monitoramento de conformidade em sites corporativos e e-commerces',
        'Relatórios explicáveis sem juridiquês inútil'
      ]
    },
    {
      icon: Code2,
      role: 'Desenvolvedores & Engenheiros Web',
      tagline: 'Depuração de tags, CMPs e cabeçalhos em staging',
      benefits: [
        'Validação se scripts do GTM respeitam as escolhas do CMP',
        'Inspeção de cabeçalhos de segurança HTTP (CSP, HSTS, X-Content-Type)',
        'Detecção de cookies não seguros sem flag SameSite ou Secure',
        'Integração simples no fluxo de testes de qualidade (QA)'
      ]
    },
    {
      icon: Scale,
      role: 'Advogados & Especialistas em Direito Digital',
      tagline: 'Cadeia de custódia e prova técnica inviolável',
      benefits: [
        'Cadeia de hashes SHA-256 para prevenir alegações de adulteração de prints',
        'Histórico com timestamps milissegundos de cada requisição observada',
        'Embasamento sólido para notificações extrajudiciais ou contestações',
        'Due diligence de conformidade técnica de fornecedores e parceiros'
      ]
    },
    {
      icon: SearchCheck,
      role: 'Pesquisadores de Segurança & Usuários',
      tagline: 'Transparência total do que os sites executam no seu PC',
      benefits: [
        'Identificação de rastreamento oculto e dark patterns em banners',
        'Visualização de quem são as dezenas de terceiros recebendo seus dados',
        'Ferramenta 100% open-source e com código auditável pela comunidade',
        'Zero coleta de telemetria sobre a sua própria navegação'
      ]
    }
  ];

  return (
    <section id="para-quem" className="audience-section">
      <div className="section-header">
        <div className="section-badge">
          <Users size={14} />
          <span>Casos de Uso</span>
        </div>
        <h2 className="section-title">
          Projetado para Profissionais que Exigem Rigor Técnico
        </h2>
        <p className="section-subtitle">
          Seja para validar conformidade com a LGPD, defender direitos ou garantir que o código
          do seu produto respeite o usuário, o PrivacyLens é sua lente técnica definitiva.
        </p>
      </div>

      <div className="audience-grid">
        {audiences.map((aud, idx) => {
          const Icon = aud.icon;
          return (
            <div key={idx} className="audience-card">
              <div className="audience-card-header">
                <div className="audience-icon-box">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="audience-title">{aud.role}</h3>
                  <span className="audience-tagline">{aud.tagline}</span>
                </div>
              </div>

              <div className="audience-benefits">
                {aud.benefits.map((b, bIdx) => (
                  <div key={bIdx} className="benefit-row">
                    <Check size={15} className="check-icon" />
                    <span>{b}</span>
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
