import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Scale
} from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  const features = [
    {
      name: 'Auditoria em Tempo Real no Navegador Real',
      projectLens: 'yes',
      adblockers: 'partial',
      saasScanners: 'no',
      devtools: 'yes',
      notes: 'O ProjectLens roda exatamente na sua sessão e IP, sem divergência de geolocalização.'
    },
    {
      name: 'Detecção de CMPs & Comparação Pré/Pós Consentimento',
      projectLens: 'yes',
      adblockers: 'no',
      saasScanners: 'partial',
      devtools: 'no',
      notes: 'Registra o momento exato do clique em Aceitar/Rejeitar e compara mutações.'
    },
    {
      name: 'Cadeia de Integridade Criptográfica (SHA-256)',
      projectLens: 'yes',
      adblockers: 'no',
      saasScanners: 'no',
      devtools: 'no',
      notes: 'Garante que os logs não foram forjados ou editados manualmente.'
    },
    {
      name: 'Zero Telemetria (100% dos dados na sua máquina)',
      projectLens: 'yes',
      adblockers: 'yes',
      saasScanners: 'no',
      devtools: 'yes',
      notes: 'Seus dados de navegação nunca são enviados a servidores externos.'
    },
    {
      name: 'Exportação de Dossiê Estruturado (JSON)',
      projectLens: 'yes',
      adblockers: 'no',
      saasScanners: 'partial',
      devtools: 'partial',
      notes: 'Arquivo padronizado pronto para anexar a relatórios técnicos de LGPD.'
    },
    {
      name: 'Separação entre Fato Técnico e Enquadramento Legal',
      projectLens: 'yes',
      adblockers: 'no',
      saasScanners: 'no',
      devtools: 'no',
      notes: 'Metodologia explicável que não comete o erro de emitir vereditos automatizados.'
    },
    {
      name: '100% Gratuito & Código Aberto (Open Source)',
      projectLens: 'yes',
      adblockers: 'yes',
      saasScanners: 'no',
      devtools: 'yes',
      notes: 'Sem planos mensais ou limites de URLs por dia.'
    }
  ];

  const renderIcon = (status: string) => {
    if (status === 'yes') {
      return <CheckCircle2 size={18} className="text-emerald" />;
    }
    if (status === 'partial') {
      return <AlertCircle size={18} className="text-amber" />;
    }
    return <XCircle size={18} className="text-muted-icon" />;
  };

  return (
    <section id="comparativo" className="comparison-section">
      <div className="section-header">
        <div className="section-badge">
          <Scale size={14} />
          <span>Análise Comparativa</span>
        </div>
        <h2 className="section-title">
          Por que o ProjectLens é a Abordagem Ideal?
        </h2>
        <p className="section-subtitle">
          Veja como o ProjectLens se compara a outras ferramentas de mercado e extensões convencionais.
        </p>
      </div>

      <div className="table-responsive-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="th-feature">Critério de Auditoria</th>
              <th className="th-highlight">
                <div className="th-projectlens-badge">ProjectLens</div>
              </th>
              <th>Bloqueadores de Anúncios</th>
              <th>Scanners SaaS Remotos</th>
              <th>DevTools Manual</th>
            </tr>
          </thead>
          <tbody>
            {features.map((item, idx) => (
              <tr key={idx}>
                <td className="td-feature">
                  <strong>{item.name}</strong>
                  <span className="td-notes">{item.notes}</span>
                </td>
                <td className="td-highlight">
                  <div className="status-flex">{renderIcon(item.projectLens)}</div>
                </td>
                <td>
                  <div className="status-flex">{renderIcon(item.adblockers)}</div>
                </td>
                <td>
                  <div className="status-flex">{renderIcon(item.saasScanners)}</div>
                </td>
                <td>
                  <div className="status-flex">{renderIcon(item.devtools)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
