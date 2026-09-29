import React, { useState } from 'react';
import { 
  Shield, 
  Play, 
  Square, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Cookie, 
  Database, 
  Globe, 
  Lock, 
  Link as LinkIcon, 
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

type Tab = 'overview' | 'consent' | 'cookies' | 'network' | 'security' | 'evidence';

interface MockCookie {
  name: string;
  domain: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string;
  sourceContext: 'before_consent' | 'after_consent';
  isSuspicious?: boolean;
}

export const InteractiveSimulator: React.FC = () => {
  // Simulator state
  const [isAuditing, setIsAuditing] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [consentChoice, setConsentChoice] = useState<'NONE' | 'REJECTED_ALL' | 'ACCEPTED_ALL'>('REJECTED_ALL');
  const [isVerifying, setIsVerifying] = useState(false);
  const [chainVerified, setChainVerified] = useState<boolean | null>(true);
  const [showJsonModal, setShowJsonModal] = useState(false);

  // Mock cookies based on consent state
  const cookies: MockCookie[] = [
    { name: 'session_id', domain: '.loja-exemplo.com.br', secure: true, httpOnly: true, sameSite: 'lax', sourceContext: 'before_consent' as const },
    { name: 'csrf_token', domain: 'loja-exemplo.com.br', secure: true, httpOnly: false, sameSite: 'strict', sourceContext: 'before_consent' as const },
    ...(consentChoice === 'REJECTED_ALL' ? [
      { name: 'opt_out_consent', domain: '.loja-exemplo.com.br', secure: true, httpOnly: false, sameSite: 'lax', sourceContext: 'after_consent' as const },
      { name: '_fbp', domain: '.facebook.com', secure: true, httpOnly: false, sameSite: 'lax', sourceContext: 'after_consent' as const, isSuspicious: true }
    ] : consentChoice === 'ACCEPTED_ALL' ? [
      { name: '_ga', domain: '.loja-exemplo.com.br', secure: true, httpOnly: false, sameSite: 'lax', sourceContext: 'after_consent' as const },
      { name: '_fbp', domain: '.facebook.com', secure: true, httpOnly: false, sameSite: 'lax', sourceContext: 'after_consent' as const },
      { name: '_hjSession', domain: '.loja-exemplo.com.br', secure: true, httpOnly: false, sameSite: 'no_restriction', sourceContext: 'after_consent' as const }
    ] : [])
  ];

  const thirdParties = [
    { domain: 'connect.facebook.net', method: 'GET', status: consentChoice === 'REJECTED_ALL' ? '200 (Disparado pós-recusa)' : '200' },
    { domain: 'www.google-analytics.com', method: 'POST', status: consentChoice === 'REJECTED_ALL' ? 'Bloqueado (GTM)' : '200' },
    { domain: 'static.hotjar.com', method: 'GET', status: consentChoice === 'ACCEPTED_ALL' ? '200' : 'Não disparado' },
    { domain: 'cdn.trustpilot.net', method: 'GET', status: '200' }
  ];

  const evidenceEvents = [
    {
      id: 'ev-1',
      index: 1,
      type: 'AUDIT_STARTED',
      timestamp: '20:15:02',
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    {
      id: 'ev-2',
      index: 2,
      type: 'COOKIE_DETECTED (session_id)',
      timestamp: '20:15:03',
      prevHash: 'e3b0c44298fc1c14...852b855',
      hash: '7a892b1567d268d0bb19c362a2656ca864c39832a818c7e99742a0e4e6fb22cf'
    },
    {
      id: 'ev-3',
      index: 3,
      type: 'CONSENT_ACTION (REJECTED_ALL)',
      timestamp: '20:15:10',
      prevHash: '7a892b1567d268d0...e6fb22cf',
      hash: '9f83c18b76c81373516584285b7e3e970ac779f72b9a712f5a6b0c2794c4ec9e'
    },
    {
      id: 'ev-4',
      index: 4,
      type: 'THIRD_PARTY_REQUEST (connect.facebook.net)',
      timestamp: '20:15:11',
      prevHash: '9f83c18b76c81373...94c4ec9e',
      hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
    }
  ];

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setChainVerified(true);
    }, 550);
  };

  const handleToggleAudit = () => {
    setIsAuditing(!isAuditing);
    setChainVerified(null);
  };

  return (
    <section id="simulador" className="simulator-section">
      <div className="section-header">
        <div className="section-badge">
          <Sparkles size={14} />
          <span>Demonstração Interativa</span>
        </div>
        <h2 className="section-title">
          Experimente o ProjectLens Diretamente no Navegador
        </h2>
        <p className="section-subtitle">
          Veja abaixo a extensão em ação simulando uma auditoria técnica em uma loja virtual fictícia.
          Interaja com os controles, altere a escolha no banner de consentimento e teste a verificação da cadeia criptográfica.
        </p>
      </div>

      {/* Simulator Frame (Simulates a full browser window with Web page + Extension Sidepanel) */}
      <div className="browser-window">
        {/* Browser Top Bar */}
        <div className="browser-topbar">
          <div className="traffic-lights">
            <span className="light light-red"></span>
            <span className="light light-yellow"></span>
            <span className="light light-green"></span>
          </div>
          <div className="browser-address-bar">
            <Lock size={13} className="text-emerald" />
            <span className="address-text">https://loja-exemplo.com.br/checkout</span>
            <RefreshCw size={12} className="refresh-icon" />
          </div>
          <div className="browser-actions">
            <div className="extension-icon-active" title="ProjectLens Side Panel Aberto">
              <Shield size={16} color="#38bdf8" />
              <span className="active-dot"></span>
            </div>
          </div>
        </div>

        {/* Browser Body: Left = Website DOM, Right = ProjectLens Side Panel */}
        <div className="browser-viewport">
          
          {/* Left: Mock Website Page */}
          <div className="website-viewport">
            <div className="mock-site-header">
              <div className="mock-site-logo">📦 LojaModa Brasil</div>
              <div className="mock-site-nav">
                <span>Novidades</span>
                <span>Feminino</span>
                <span>Masculino</span>
                <span>Ofertas</span>
              </div>
            </div>

            <div className="mock-site-content">
              <div className="mock-banner-hero">
                <h3>Coleção Outono/Inverno 2026</h3>
                <p>Compre online com segurança e entrega para todo o Brasil.</p>
                <div className="mock-dummy-card">
                  <div className="mock-card-img"></div>
                  <div className="mock-card-text">
                    <span className="mock-line-1"></span>
                    <span className="mock-line-2"></span>
                  </div>
                </div>
              </div>

              {/* Simulated CMP Consent Banner Floating on Bottom */}
              <div className="simulated-cmp-banner">
                <div className="cmp-header">
                  <div className="cmp-title">
                    <Shield size={15} color="#38bdf8" />
                    <strong>Preferências de Cookies e Privacidade (CMP Detectada)</strong>
                  </div>
                  <span className="cmp-tag">OneTrust / Cookiebot Engine</span>
                </div>
                <p className="cmp-text">
                  Utilizamos cookies essenciais, analíticos e de terceiros para aprimorar sua experiência. 
                  Você tem o direito de recusar rastreadores de publicidade de acordo com a LGPD.
                </p>
                <div className="cmp-buttons">
                  <button 
                    className={`btn-cmp-choice ${consentChoice === 'REJECTED_ALL' ? 'active-reject' : ''}`}
                    onClick={() => setConsentChoice('REJECTED_ALL')}
                  >
                    Rejeitar Não Essenciais
                  </button>
                  <button 
                    className={`btn-cmp-choice ${consentChoice === 'ACCEPTED_ALL' ? 'active-accept' : ''}`}
                    onClick={() => setConsentChoice('ACCEPTED_ALL')}
                  >
                    Aceitar Todos
                  </button>
                  <button 
                    className="btn-cmp-outline"
                    onClick={() => setConsentChoice('NONE')}
                  >
                    Resetar Banner
                  </button>
                </div>
                <div className="cmp-status-hint">
                  <Info size={13} />
                  <span>
                    {consentChoice === 'REJECTED_ALL' 
                      ? 'Opção "Rejeitar" selecionada. Note na extensão o alerta de cookie de terceiro disparado mesmo após a recusa!'
                      : consentChoice === 'ACCEPTED_ALL'
                      ? 'Opção "Aceitar" selecionada. Todos os rastreadores foram ativados com consentimento formal.'
                      : 'Nenhuma ação executada ainda. O estado atual é BANNER_DETECTED.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: ProjectLens Sidepanel UI (Faithful replica of src/sidepanel/App.tsx) */}
          <div className="sidepanel-viewport">
            {/* Header */}
            <div className="sp-header">
              <div className="sp-brand">
                <Shield size={18} color="#38bdf8" />
                <span className="sp-title">ProjectLens</span>
              </div>
              <div>
                {!isAuditing ? (
                  <span className="sp-badge sp-badge-idle">Inativo</span>
                ) : (
                  <span className="sp-badge sp-badge-recording">
                    <span className="pulse-indicator"></span> Gravando Auditoria
                  </span>
                )}
              </div>
            </div>

            {/* Control Bar */}
            <div className="sp-controls">
              <div className="sp-url" title="https://loja-exemplo.com.br">
                loja-exemplo.com.br
              </div>
              <div className="sp-btn-group">
                <button 
                  className={`sp-btn ${isAuditing ? 'sp-btn-danger' : 'sp-btn-primary'}`}
                  onClick={handleToggleAudit}
                >
                  {isAuditing ? <Square size={13} /> : <Play size={13} />}
                  <span>{isAuditing ? 'Parar' : 'Iniciar'}</span>
                </button>
                <button 
                  className="sp-btn sp-btn-secondary" 
                  onClick={() => setShowJsonModal(true)}
                  title="Exportar Relatório JSON"
                >
                  <Download size={13} />
                </button>
              </div>
            </div>

            {/* Nav Tabs */}
            <nav className="sp-tabs">
              <button 
                className={`sp-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <Layers size={12} /> Visão Geral
              </button>
              <button 
                className={`sp-tab ${activeTab === 'consent' ? 'active' : ''}`}
                onClick={() => setActiveTab('consent')}
              >
                <Shield size={12} /> Consentimento
              </button>
              <button 
                className={`sp-tab ${activeTab === 'cookies' ? 'active' : ''}`}
                onClick={() => setActiveTab('cookies')}
              >
                <Cookie size={12} /> Cookies ({cookies.length})
              </button>
              <button 
                className={`sp-tab ${activeTab === 'network' ? 'active' : ''}`}
                onClick={() => setActiveTab('network')}
              >
                <Globe size={12} /> Rede ({thirdParties.length})
              </button>
              <button 
                className={`sp-tab ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <Lock size={12} /> Segurança
              </button>
              <button 
                className={`sp-tab ${activeTab === 'evidence' ? 'active' : ''}`}
                onClick={() => setActiveTab('evidence')}
              >
                <LinkIcon size={12} /> Cadeia ({evidenceEvents.length})
              </button>
            </nav>

            {/* Sidepanel Content */}
            <div className="sp-content">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="sp-tab-body">
                  <div className="sp-metric-grid">
                    <div className="sp-metric-card">
                      <div className="label">Cookies Observados</div>
                      <div className="value">{cookies.length}</div>
                    </div>
                    <div className="sp-metric-card">
                      <div className="label">Terceiros Detectados</div>
                      <div className="value">{thirdParties.length}</div>
                    </div>
                    <div className="sp-metric-card">
                      <div className="label">Itens de Storage</div>
                      <div className="value">4</div>
                    </div>
                    <div className="sp-metric-card">
                      <div className="label">Cadeia SHA-256</div>
                      <div className="value text-cyan">{evidenceEvents.length} nós</div>
                    </div>
                  </div>

                  <div className="sp-card">
                    <h4>Metodologia de Auditoria Explicável</h4>
                    <p className="sp-muted-text">
                      O ProjectLens separa <strong>fatos observáveis</strong> de interpretações para apoiar a análise jurídica de conformidade com a LGPD.
                    </p>
                    <div className="sp-info-rows">
                      <div className="sp-info-row">
                        <span>Consentimento Observado:</span>
                        <span className={`sp-tag ${consentChoice === 'REJECTED_ALL' ? 'tag-warn' : 'tag-success'}`}>
                          {consentChoice}
                        </span>
                      </div>
                      <div className="sp-info-row">
                        <span>Integridade Criptográfica:</span>
                        <span className="sp-tag tag-success">SHA-256 Ativo</span>
                      </div>
                      <div className="sp-info-row">
                        <span>Telemetria Externa:</span>
                        <span className="sp-tag tag-local">0% (100% Local)</span>
                      </div>
                    </div>
                  </div>

                  {consentChoice === 'REJECTED_ALL' && (
                    <div className="sp-alert-box alert-warning">
                      <AlertTriangle size={15} />
                      <div>
                        <strong>Evidência Notável:</strong> Cookie de terceiro <code>_fbp</code> foi observado na rede mesmo após ação de recusa do banner.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CONSENT */}
              {activeTab === 'consent' && (
                <div className="sp-tab-body">
                  <div className="sp-card">
                    <h4>Status de Consentimento do Banner CMP</h4>
                    <p className="sp-muted-text">Ações capturadas via content script no DOM:</p>
                    <div className="sp-timeline">
                      <div className="timeline-item">
                        <div className="time">20:15:01</div>
                        <div className="desc">
                          <strong>BANNER_DETECTED</strong> — Seletor <code>#onetrust-banner-sdk</code> identificado.
                        </div>
                      </div>
                      {consentChoice !== 'NONE' && (
                        <div className="timeline-item highlight">
                          <div className="time">20:15:10</div>
                          <div className="desc">
                            <strong>{consentChoice}</strong> — Clique capturado no botão de preferência do usuário.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: COOKIES */}
              {activeTab === 'cookies' && (
                <div className="sp-tab-body">
                  <div className="sp-card">
                    <h4>Cookies Observados ({cookies.length})</h4>
                    <div className="sp-table-wrap">
                      <table className="sp-table">
                        <thead>
                          <tr>
                            <th>Nome</th>
                            <th>Domínio</th>
                            <th>Atributos</th>
                            <th>Momento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cookies.map((c, i) => (
                            <tr key={i} className={c.isSuspicious ? 'row-alert' : ''}>
                              <td className="mono font-bold">
                                {c.name}
                                {c.isSuspicious && <span className="suspicious-badge">Atenção</span>}
                              </td>
                              <td className="mono">{c.domain}</td>
                              <td>
                                <span className={`tag-mini ${c.secure ? 'tag-green' : 'tag-red'}`}>
                                  {c.secure ? 'Secure' : '!Secure'}
                                </span>
                                <span className={`tag-mini ${c.httpOnly ? 'tag-green' : 'tag-gray'}`}>
                                  {c.httpOnly ? 'HttpOnly' : 'JS'}
                                </span>
                              </td>
                              <td>
                                <span className="tag-context">{c.sourceContext}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: NETWORK */}
              {activeTab === 'network' && (
                <div className="sp-tab-body">
                  <div className="sp-card">
                    <h4>Requisições a Terceiros ({thirdParties.length})</h4>
                    <div className="sp-table-wrap">
                      <table className="sp-table">
                        <thead>
                          <tr>
                            <th>Domínio Externo</th>
                            <th>Método</th>
                            <th>Status Observado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {thirdParties.map((tp, idx) => (
                            <tr key={idx}>
                              <td className="mono text-cyan">{tp.domain}</td>
                              <td>{tp.method}</td>
                              <td>{tp.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SECURITY HEADERS */}
              {activeTab === 'security' && (
                <div className="sp-tab-body">
                  <div className="sp-card">
                    <h4>Cabeçalhos HTTP de Segurança</h4>
                    <div className="sp-table-wrap">
                      <table className="sp-table">
                        <thead>
                          <tr>
                            <th>Cabeçalho</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="mono">Strict-Transport-Security</td>
                            <td><span className="tag-green">max-age=31536000; includeSubDomains</span></td>
                          </tr>
                          <tr>
                            <td className="mono">X-Content-Type-Options</td>
                            <td><span className="tag-green">nosniff</span></td>
                          </tr>
                          <tr>
                            <td className="mono">Content-Security-Policy</td>
                            <td><span className="tag-red">Ausente (Aviso: Risco XSS)</span></td>
                          </tr>
                          <tr>
                            <td className="mono">Referrer-Policy</td>
                            <td><span className="tag-green">strict-origin-when-cross-origin</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: EVIDENCE & HASH CHAIN */}
              {activeTab === 'evidence' && (
                <div className="sp-tab-body">
                  <div className="sp-card">
                    <div className="sp-card-header-flex">
                      <h4>Cadeia Criptográfica (SHA-256)</h4>
                      <button 
                        className="btn-verify-chain"
                        onClick={handleVerify}
                        disabled={isVerifying}
                      >
                        <CheckCircle2 size={13} />
                        <span>{isVerifying ? 'Calculando...' : 'Verificar Integridade'}</span>
                      </button>
                    </div>

                    {chainVerified && (
                      <div className="chain-status-box valid">
                        <CheckCircle2 size={16} />
                        <span><strong>Cadeia Válida:</strong> Todos os 4 hashes SHA-256 e ligações previous_hash conferidos sem adulteração.</span>
                      </div>
                    )}

                    <div className="evidence-list">
                      {evidenceEvents.map((ev) => (
                        <div key={ev.id} className="ev-item">
                          <div className="ev-header">
                            <span className="ev-idx">#{ev.index} — {ev.type}</span>
                            <span className="ev-time">{ev.timestamp}</span>
                          </div>
                          <div className="ev-hashes">
                            <div><span className="hash-label">Prev:</span> <span className="mono">{ev.prevHash.substring(0, 24)}...</span></div>
                            <div><span className="hash-label">Hash:</span> <span className="mono text-cyan">{ev.hash.substring(0, 32)}...</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* JSON Export Modal */}
      {showJsonModal && (
        <div className="modal-backdrop" onClick={() => setShowJsonModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-cyan" />
                <h3>Exemplo de Relatório Exportado (JSON Canônico)</h3>
              </div>
              <button className="btn-close" onClick={() => setShowJsonModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="text-xs text-muted mb-2">
                O ProjectLens gera relatórios estruturados prontos para anexar a relatórios de conformidade (RIPD/DPIA) ou auditorias técnicas:
              </p>
              <pre className="json-preview">
{JSON.stringify({
  auditSessionId: "lens-session-20260929-1945",
  targetUrl: "https://loja-exemplo.com.br/checkout",
  targetDomain: "loja-exemplo.com.br",
  startedAt: "2026-09-29T20:15:02.114Z",
  status: "COMPLETED",
  currentConsentState: consentChoice,
  totalCookiesObserved: cookies.length,
  thirdPartiesDetected: thirdParties.length,
  chainIntegrityValid: true,
  evidenceEvents: evidenceEvents.map(e => ({
    eventType: e.type,
    timestamp: e.timestamp,
    previousHash: e.prevHash,
    hash: e.hash
  }))
}, null, 2)}
              </pre>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowJsonModal(false)}>
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
