import React, { useState } from 'react';
import { 
  Download,
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface InstallationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REPO_URL = 'https://github.com/lira100111/PrivacyLens_repo';
const RELEASES_URL = 'https://github.com/lira100111/PrivacyLens_repo/releases';
const RELEASE_FILE = 'PrivacyLens_1.0.0.zip';

export const InstallationModal: React.FC<InstallationModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-cyan" />
            <h3>Como Instalar o PrivacyLens no seu Navegador</h3>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Fechar">×</button>
        </div>

        <div className="modal-body">
          <div className="install-modal-banner">
            <div className="text-sm">
              <strong>Versão 1.0.0</strong> disponível para Google Chrome, Brave, Microsoft Edge e navegadores Chromium — sem necessidade de clonar o repositório ou instalar dependências.
            </div>
          </div>

          <div className="modal-steps-container">
            {/* Step 1 */}
            <div className="modal-step">
              <div className="modal-step-badge">1</div>
              <div className="modal-step-body">
                <h4>Baixar a Release no GitHub</h4>
                <p className="text-xs text-muted mb-2">
                  Acesse a página de releases do repositório{' '}
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="install-inline-link"
                  >
                    https://github.com/lira100111/PrivacyLens_repo
                  </a>{' '}
                  e faça o download do arquivo <code>{RELEASE_FILE}</code>:
                </p>
                <div className="install-step-actions">
                  <a
                    href={RELEASES_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-install-download"
                  >
                    <Download size={14} />
                    <span>Baixar {RELEASE_FILE} no GitHub</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="modal-step">
              <div className="modal-step-badge">2</div>
              <div className="modal-step-body">
                <h4>Descompactar o Arquivo Baixado</h4>
                <p className="text-xs text-muted">
                  Extraia todo o conteúdo do arquivo <code>{RELEASE_FILE}</code> para uma pasta no seu computador.
                  Mantenha essa pasta em um local fixo, pois o Chrome a utilizará enquanto a extensão estiver carregada.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="modal-step">
              <div className="modal-step-badge">3</div>
              <div className="modal-step-body">
                <h4>Carregar Extensão sem Compactação no Chrome</h4>
                <div className="code-box mb-2">
                  <code>chrome://extensions</code>
                  <button 
                    className="btn-copy"
                    onClick={() => copyToClipboard('chrome://extensions', 1)}
                    title="Copiar endereço"
                  >
                    {copiedIndex === 1 ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                  </button>
                </div>
                <ol className="modal-ol-list">
                  <li>No navegador, digite e acesse: <code>chrome://extensions</code></li>
                  <li>No canto superior direito, ative a chave <strong>"Modo do desenvolvedor"</strong> (Developer mode).</li>
                  <li>Clique no botão <strong>"Carregar sem compactação"</strong> (Load unpacked).</li>
                  <li>Selecione a pasta extraída do arquivo <strong><code>{RELEASE_FILE}</code></strong>.</li>
                  <li>Pronto! O ícone de escudo do PrivacyLens estará ativo na sua barra de extensões.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <a 
            href={RELEASES_URL} 
            target="_blank" 
            rel="noreferrer" 
            className="btn-secondary"
          >
            <span>Ver Releases no GitHub</span>
            <ExternalLink size={14} />
          </a>
          <button className="btn-primary" onClick={onClose}>
            Entendido, vou testar!
          </button>
        </div>
      </div>
    </div>
  );
};
