import React from 'react';
import { 
  Scale, 
  Binary, 
  ShieldAlert, 
  EyeOff, 
  Fingerprint, 
  FileCheck2,
  Lock,
  ArrowRight
} from 'lucide-react';

export const ValueProps: React.FC = () => {
  return (
    <section id="metodologia" className="value-props-section">
      <div className="section-header">
        <div className="section-badge">
          <Binary size={14} />
          <span>Pilares & Fundamentação</span>
        </div>
        <h2 className="section-title">
          Não Suposições. Provas Técnicas e Explicáveis.
        </h2>
        <p className="section-subtitle">
          O PrivacyLens foi desenhado com rigor metodológico para apoiar encarregados de dados (DPOs),
          equipes jurídicas e auditores com evidências concretas e sem viés.
        </p>
      </div>

      <div className="value-cards-grid">
        {/* Card 1 */}
        <div className="value-card">
          <div className="value-icon-box text-cyan">
            <Scale size={26} />
          </div>
          <h3 className="value-title">Separação entre Fato e Direito</h3>
          <p className="value-desc">
            A ferramenta nunca emite julgamentos arbitrários. Ela registra o <strong>fato observável</strong> (ex: "cookie de marketing injetado pós-recusa"),
            aponta a <strong>interpretação técnica</strong> e referencia as diretrizes da ANPD. A conclusão jurídica é do auditor.
          </p>
          <div className="value-highlight">
            <code>Observação ➔ Interpretação ➔ Base Normativa</code>
          </div>
        </div>

        {/* Card 2 */}
        <div className="value-card featured">
          <div className="value-icon-box text-emerald">
            <Fingerprint size={26} />
          </div>
          <h3 className="value-title">Cadeia Criptográfica SHA-256</h3>
          <p className="value-desc">
            Cada evento auditado tem seu hash SHA-256 calculado sobre um JSON canônico e amarrado ao hash do evento anterior:
            <code>Hash_n = SHA-256(Evento + Hash_n-1)</code>. Qualquer tentativa de adulterar um log quebra a cadeia na hora.
          </p>
          <div className="value-highlight">
            <span className="text-emerald font-semibold">Integridade Matemática Inviolável</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="value-card">
          <div className="value-icon-box text-sky">
            <EyeOff size={26} />
          </div>
          <h3 className="value-title">Privacidade por Design (Zero Telemetria)</h3>
          <p className="value-desc">
            Uma ferramenta de privacidade deve respeitar a sua própria privacidade. O PrivacyLens não possui servidores externos de coleta,
            não monitora seu uso e guarda 100% das evidências localmente no seu <code>chrome.storage.local</code>.
          </p>
          <div className="value-highlight">
            <code>Sem APIs remotas • Sem rastreadores próprios</code>
          </div>
        </div>

        {/* Card 4 */}
        <div className="value-card">
          <div className="value-icon-box text-purple">
            <FileCheck2 size={26} />
          </div>
          <h3 className="value-title">Pronto para RIPD e Dossiês</h3>
          <p className="value-desc">
            Exporte relatórios estruturados com timestamps milissegundos, hashes criptográficos, lista de terceiros e atributos de segurança.
            Anexe diretamente a pareceres técnicos, contestações e auditorias de conformidade.
          </p>
          <div className="value-highlight">
            <code>Exportação JSON Canônica + Logs Timestamped</code>
          </div>
        </div>
      </div>
    </section>
  );
};
