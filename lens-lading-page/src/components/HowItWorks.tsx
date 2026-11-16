import React from 'react';
import { 
  Play, 
  MousePointerClick, 
  CheckCircle2, 
  Download,
  Terminal,
  ShieldAlert
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Abra a Página e Abra o Side Panel',
      description: 'Acesse o site a ser auditado e clique no ícone do PrivacyLens na barra do Chrome para abrir o painel lateral fixo.',
      icon: Terminal
    },
    {
      step: '02',
      title: 'Inicie a Coleta e Interaja com o Banner',
      description: 'Clique em "Iniciar" para ativar os coletores em tempo real. Interaja com o banner de cookies escolhendo Aceitar, Rejeitar ou Personalizar.',
      icon: MousePointerClick
    },
    {
      step: '03',
      title: 'Analise os Fatos Observados',
      description: 'Veja se cookies de terceiros foram gravados antes da permissão, confira cabeçalhos HTTP e inspecione scripts de rastreamento disparados.',
      icon: CheckCircle2
    },
    {
      step: '04',
      title: 'Verifique a Cadeia e Exporte o JSON',
      description: 'Valide a integridade dos hashes SHA-256 em um clique e faça download do dossiê técnico para anexar ao seu relatório ou parecer de auditoria.',
      icon: Download
    }
  ];

  return (
    <section className="how-it-works-section">
      <div className="section-header">
        <div className="section-badge">
          <Play size={14} />
          <span>Fluxo de Auditoria</span>
        </div>
        <h2 className="section-title">
          Como Auditar um Website em 4 Passos Simples
        </h2>
        <p className="section-subtitle">
          Sem instalações de servidores complexos, sem proxies intermediários e sem configurações lentas.
        </p>
      </div>

      <div className="steps-grid">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="step-card">
              <div className="step-number">{s.step}</div>
              <div className="step-icon-box">
                <Icon size={20} />
              </div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-description">{s.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
