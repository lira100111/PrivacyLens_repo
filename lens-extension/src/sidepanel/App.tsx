import { Fragment, useMemo, useState } from 'react';
import { useAuditSession } from '../hooks/useAuditSession';
import {
  buildSessionRiskReport,
  assessChainIntegrity,
  compareRisk,
  RISK_CATEGORY_LABELS
} from '../shared/risk-analysis';
import { RiskNote, RiskSummaryBar } from './components/RiskNote';
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
  Layers
} from 'lucide-react';

type Tab = 'overview' | 'consent' | 'cookies' | 'network' | 'security' | 'evidence';

export default function App() {
  const { 
    session, 
    isLoading, 
    isVerifying, 
    chainStatus, 
    startAudit, 
    stopAudit, 
    verifyChain, 
    exportReport 
  } = useAuditSession();

  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const cookiesList = session ? Object.values(session.cookies) : [];
  const thirdPartyRequests = session 
    ? session.networkRequests.filter((r) => r.isThirdParty) 
    : [];

  // RF17 — risk explanations derived from the collected evidence (not stored in the chain)
  const riskReport = useMemo(() => (session ? buildSessionRiskReport(session) : null), [session]);
  const cookieEntries = session ? Object.entries(session.cookies) : [];
  const thirdPartyAssessed = session && riskReport
    ? session.networkRequests
        .map((req, i) => ({ req, risk: riskReport.network[i] }))
        .filter(({ req }) => req.isThirdParty)
    : [];
  const topRisks = riskReport
    ? riskReport.items
        .filter((item) => item.assessment.level === 'high' || item.assessment.level === 'medium')
        .sort((a, b) => compareRisk(a.assessment, b.assessment))
    : [];

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="header">
        <div className="brand">
          <Shield size={20} color="#38bdf8" />
          <h1>ProjectLens</h1>
        </div>
        <div>
          {!session || session.status === 'IDLE' ? (
            <span className="badge badge-idle">Inativo</span>
          ) : session.status === 'RECORDING' ? (
            <span className="badge badge-recording">Gravando Auditoria</span>
          ) : (
            <span className="badge badge-completed">Concluído</span>
          )}
        </div>
      </header>

      {/* Action Controls Bar */}
      <div className="controls-bar">
        <div className="url-display" title={session?.targetUrl || 'Nenhum site em auditoria'}>
          {session?.targetUrl ? session.targetUrl : 'Pronto para auditar a aba ativa'}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(!session || session.status !== 'RECORDING') ? (
            <button className="btn btn-primary" onClick={startAudit} disabled={isLoading}>
              <Play size={14} /> Iniciar
            </button>
          ) : (
            <button className="btn btn-danger" onClick={stopAudit} disabled={isLoading}>
              <Square size={14} /> Parar
            </button>
          )}

          {session && (
            <button className="btn btn-secondary" onClick={exportReport} title="Exportar Relatório JSON">
              <Download size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Layers size={13} /> Visão Geral
        </button>
        <button 
          className={`tab-btn ${activeTab === 'consent' ? 'active' : ''}`}
          onClick={() => setActiveTab('consent')}
        >
          <Shield size={13} /> Consentimento
        </button>
        <button 
          className={`tab-btn ${activeTab === 'cookies' ? 'active' : ''}`}
          onClick={() => setActiveTab('cookies')}
        >
          <Cookie size={13} /> Cookies ({cookiesList.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'network' ? 'active' : ''}`}
          onClick={() => setActiveTab('network')}
        >
          <Globe size={13} /> Rede ({thirdPartyRequests.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Lock size={13} /> Segurança
        </button>
        <button 
          className={`tab-btn ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => setActiveTab('evidence')}
        >
          <LinkIcon size={13} /> Cadeia ({session?.evidenceEvents.length || 0})
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="content-area">
        {!session ? (
          <div className="empty-state">
            <Shield size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>Nenhuma sessão ativa.</p>
            <p style={{ fontSize: '11px', marginTop: '6px', color: '#64748b' }}>
              Clique em <strong>"Iniciar"</strong> para iniciar a coleta e auditoria técnica da página atual.
            </p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div>
                <div className="metric-grid">
                  <div className="metric-card">
                    <div className="metric-label">Cookies Observados</div>
                    <div className="metric-value">{cookiesList.length}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Terceiros Detectados</div>
                    <div className="metric-value">{thirdPartyRequests.length}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Itens de Storage</div>
                    <div className="metric-value">{session.storageItems.length}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Evidências na Cadeia</div>
                    <div className="metric-value">{session.evidenceEvents.length}</div>
                  </div>
                </div>

                {riskReport && (
                  <div className="card">
                    <h2><AlertTriangle size={14} /> Riscos para o Usuário</h2>
                    <RiskSummaryBar assessments={riskReport.items.map((item) => item.assessment)} />
                    {topRisks.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>
                        Nenhum risco médio ou alto identificado até o momento.
                      </p>
                    ) : (
                      <div className="risk-list">
                        {topRisks.slice(0, 6).map((item, idx) => (
                          <RiskNote
                            key={`${item.category}-${item.subject}-${idx}`}
                            title={`${RISK_CATEGORY_LABELS[item.category]} · ${item.subject}`}
                            assessment={item.assessment}
                          />
                        ))}
                        {topRisks.length > 6 && (
                          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                            + {topRisks.length - 6} itens com risco. Consulte as abas para ver todos.
                          </p>
                        )}
                      </div>
                    )}
                    <p className="risk-disclaimer">
                      Classificação heurística baseada nos fatos observados; não constitui parecer jurídico.
                    </p>
                  </div>
                )}

                <div className="card">
                  <h2>Metodologia de Auditoria Explicável</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11.5px', marginBottom: '8px' }}>
                    O ProjectLens separa <strong>fatos observáveis</strong> de <strong>interpretações técnicas</strong> para apoiar a análise jurídica de proteção de dados (LGPD).
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '11.5px' }}>
                      <strong>Estado de Consentimento:</strong>{' '}
                      <span className="badge-tag yes">{session.currentConsentState}</span>
                    </div>
                    <div style={{ fontSize: '11.5px' }}>
                      <strong>Domínio Auditado:</strong>{' '}
                      <span className="mono">{session.targetDomain}</span>
                    </div>
                    <div style={{ fontSize: '11.5px' }}>
                      <strong>Início:</strong> {new Date(session.startedAt).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONSENT TAB */}
            {activeTab === 'consent' && (
              <div>
                <div className="card">
                  <h2>Status de Consentimento Detectado</h2>
                  <p style={{ marginBottom: '10px', fontSize: '12px' }}>
                    Estado Atual: <strong>{session.currentConsentState}</strong>
                  </p>
                  {riskReport && (
                    <div style={{ marginBottom: '10px' }}>
                      <RiskNote assessment={riskReport.consentOverview} />
                    </div>
                  )}
                  {session.consentEvents.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>
                      Nenhuma ação de banner/consentimento registrada ainda. Interaja com o banner na página para registrar.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {session.consentEvents.map((ev, idx) => (
                        <div key={idx} style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span className="badge-tag yes">{ev.actionTaken}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              {new Date(ev.timestamp).toLocaleTimeString('pt-BR')}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px' }}>{ev.details || ev.cmpName}</div>
                          {riskReport?.consent[idx] && <RiskNote assessment={riskReport.consent[idx]} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* COOKIES & STORAGE TAB */}
            {activeTab === 'cookies' && (
              <div>
                <div className="card">
                  <h2><Cookie size={14} /> Cookies Detectados ({cookiesList.length})</h2>
                  {riskReport && <RiskSummaryBar assessments={Object.values(riskReport.cookies)} />}
                  {cookiesList.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Nenhum cookie registrado.</p>
                  ) : (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Nome</th>
                            <th>Domínio</th>
                            <th>Atributos</th>
                            <th>Momento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cookieEntries.map(([key, c]) => (
                            <Fragment key={key}>
                            <tr className="has-risk-row">
                              <td className="mono" style={{ fontWeight: 600 }}>{c.name}</td>
                              <td className="mono">{c.domain}</td>
                              <td>
                                <span className={`badge-tag ${c.secure ? 'yes' : 'no'}`}>
                                  {c.secure ? 'Secure' : '!Secure'}
                                </span>
                                <span className={`badge-tag ${c.httpOnly ? 'yes' : 'no'}`}>
                                  {c.httpOnly ? 'HttpOnly' : '!HttpOnly'}
                                </span>
                                <span className="badge-tag yes">{c.sameSite}</span>
                              </td>
                              <td>
                                <span className="badge-tag yes" style={{ fontSize: '9px' }}>
                                  {c.sourceContext}
                                </span>
                              </td>
                            </tr>
                            {riskReport?.cookies[key] && (
                              <tr className="risk-row">
                                <td colSpan={4}><RiskNote assessment={riskReport.cookies[key]} /></td>
                              </tr>
                            )}
                            </Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="card">
                  <h2><Database size={14} /> Armazenamento Local ({session.storageItems.length})</h2>
                  {riskReport && <RiskSummaryBar assessments={riskReport.storage} />}
                  {session.storageItems.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Nenhum item em localStorage/sessionStorage observado.</p>
                  ) : (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Tipo</th>
                            <th>Chave</th>
                            <th>Tamanho</th>
                          </tr>
                        </thead>
                        <tbody>
                          {session.storageItems.map((s, idx) => (
                            <Fragment key={idx}>
                            <tr className="has-risk-row">
                              <td><span className="badge-tag yes">{s.type}</span></td>
                              <td className="mono">{s.key}</td>
                              <td>{s.sizeBytes} bytes</td>
                            </tr>
                            {riskReport?.storage[idx] && (
                              <tr className="risk-row">
                                <td colSpan={3}><RiskNote assessment={riskReport.storage[idx]} /></td>
                              </tr>
                            )}
                            </Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* NETWORK & THIRD PARTIES TAB */}
            {activeTab === 'network' && (
              <div>
                <div className="card">
                  <h2><Globe size={14} /> Requisições de Terceiros ({thirdPartyRequests.length})</h2>
                  <RiskSummaryBar assessments={thirdPartyAssessed.map(({ risk }) => risk)} />
                  {thirdPartyRequests.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Nenhuma requisição de terceiros observada.</p>
                  ) : (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Domínio Terceiro</th>
                            <th>Método</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {thirdPartyAssessed.map(({ req, risk }, idx) => (
                            <Fragment key={`${req.requestId}-${idx}`}>
                            <tr className="has-risk-row">
                              <td className="mono" style={{ color: '#38bdf8' }}>{req.domain}</td>
                              <td>{req.method}</td>
                              <td>{req.statusCode || 'Pendente'}</td>
                            </tr>
                            <tr className="risk-row">
                              <td colSpan={3}><RiskNote assessment={risk} /></td>
                            </tr>
                            </Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECURITY HEADERS TAB */}
            {activeTab === 'security' && (
              <div>
                <div className="card">
                  <h2><Lock size={14} /> Cabeçalhos de Segurança HTTP</h2>
                  {!session.securityHeaders ? (
                    <p style={{ color: 'var(--text-muted)' }}>
                      Aguardando resposta do documento principal. Recarregue a página com a auditoria ativa para inspecionar os headers.
                    </p>
                  ) : (
                    <div>
                      {riskReport?.security && (
                        <div style={{ marginBottom: '12px' }}>
                          <RiskNote assessment={riskReport.security.overall} />
                        </div>
                      )}

                      {session.securityHeaders.warnings.length > 0 && (
                        <div style={{ marginBottom: '14px' }}>
                          <h3 style={{ fontSize: '11.5px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                            <AlertTriangle size={13} /> Avisos Detectados:
                          </h3>
                          <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '11px' }}>
                            {session.securityHeaders.warnings.map((w, idx) => (
                              <li key={idx}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="table-wrapper">
                        <table>
                          <thead>
                            <tr>
                              <th>Cabeçalho</th>
                              <th>Valor Observado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {riskReport?.security?.headers.map((h) => (
                              <Fragment key={h.key}>
                                <tr className="has-risk-row">
                                  <td>{h.label}</td>
                                  <td className="mono">{h.value || 'Ausente'}</td>
                                </tr>
                                <tr className="risk-row">
                                  <td colSpan={2}><RiskNote assessment={h.assessment} /></td>
                                </tr>
                              </Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EVIDENCE & SHA-256 CHAIN TAB */}
            {activeTab === 'evidence' && (
              <div>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h2><LinkIcon size={14} /> Cadeia Criptográfica de Evidências</h2>
                    <button 
                      className="btn btn-secondary" 
                      onClick={verifyChain} 
                      disabled={isVerifying || session.evidenceEvents.length === 0}
                    >
                      <CheckCircle2 size={13} /> {isVerifying ? 'Verificando...' : 'Verificar Integridade'}
                    </button>
                  </div>

                  {chainStatus && (
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginBottom: '14px',
                      background: chainStatus.isValid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: `1px solid ${chainStatus.isValid ? 'var(--success)' : 'var(--danger)'}`,
                      fontSize: '11.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {chainStatus.isValid ? (
                        <>
                          <CheckCircle2 size={16} color="var(--success)" />
                          <span><strong>Cadeia Válida:</strong> Todos os hashes SHA-256 e vínculos anteriores foram conferidos com sucesso.</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16} color="var(--danger)" />
                          <span><strong>Violação de Integridade:</strong> A cadeia foi corrompida no evento index {chainStatus.brokenAtIndex}.</span>
                        </>
                      )}
                    </div>
                  )}

                  {session.evidenceEvents.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <RiskNote title="Integridade" assessment={assessChainIntegrity(chainStatus)} />
                      {riskReport && <RiskSummaryBar assessments={Object.values(riskReport.evidence)} />}
                    </div>
                  )}

                  {session.evidenceEvents.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Nenhum evento gravado na cadeia.</p>
                  ) : (
                    <div>
                      {session.evidenceEvents.map((ev, index) => (
                        <div key={ev.id} className="hash-chain-item">
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                            <span style={{ fontWeight: 600, color: '#38bdf8' }}>
                              #{index + 1} — {ev.eventType}
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>
                              {new Date(ev.timestamp).toLocaleTimeString('pt-BR')}
                            </span>
                          </div>
                          <div className="hash-box">
                            <div><strong>Prev:</strong> {ev.previousHash.substring(0, 16)}...{ev.previousHash.substring(48)}</div>
                            <div><strong>Hash:</strong> {ev.hash}</div>
                          </div>
                          {riskReport?.evidence[ev.id] && <RiskNote assessment={riskReport.evidence[ev.id]} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
