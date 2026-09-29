import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Copy, 
  Check, 
  Chrome, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface InstallationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
            <h3>Como Instalar o ProjectLens no seu Navegador</h3>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Fechar">×</button>
        </div>

        <div className="modal-body">
          <div className="install-modal-banner">
            <div className="text-sm">
              <strong>Versão 0.1.0 (MVP)</strong> disponível para Google Chrome, Brave, Microsoft Edge e navegadores Chromium.
            </div>
          </div>

          <div className="modal-steps-container">
            {/* Step 1 */}
            <div className="modal-step">
              <div className="modal-step-badge">1</div>
              <div className="modal-step-body">
                <h4>Clonar o Repositório Git</h4>
                <p className="text-xs text-muted mb-2">Abra seu terminal e faça o clone do código-fonte oficial:</p>
                <div className="code-box">
                  <code>git clone https://github.com/leonardoferreira21/ProjectLens.git</code>
                  <button 
                    className="btn-copy"
                    onClick={() => copyToClipboard('git clone https://github.com/leonardoferreira21/ProjectLens.git', 1)}
                  >
                    {copiedIndex === 1 ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="modal-step">
              <div className="modal-step-badge">2</div>
              <div className="modal-step-body">
                <h4>Instalar Dependências e Compilar (Build)</h4>
                <p className="text-xs text-muted mb-2">Entre na pasta da extensão e execute o build do Manifest V3:</p>
                <div className="code-box">
                  <code>cd ProjectLens/lens-extension && npm install && npm run build</code>
                  <button 
                    className="btn-copy"
                    onClick={() => copyToClipboard('cd ProjectLens/lens-extension && npm install && npm run build', 2)}
                  >
                    {copiedIndex === 2 ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                  </button>
                </div>
                <p className="text-xs text-muted mt-2">
                  Isso irá gerar a pasta <code>lens-extension/dist</code> contendo o código compilado e validado em TypeScript.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="modal-step">
              <div className="modal-step-badge">3</div>
              <div className="modal-step-body">
                <h4>Carregar Extensão no Chrome</h4>
                <ol className="modal-ol-list">
                  <li>No navegador, digite e acesse: <code>chrome://extensions</code></li>
                  <li>No canto superior direito, ative a chave <strong>"Modo do desenvolvedor"</strong> (Developer mode).</li>
                  <li>Clique no botão <strong>"Carregar sem compactação"</strong> (Load unpacked).</li>
                  <li>Selecione a pasta <strong><code>lens-extension/dist</code></strong>.</li>
                  <li>Pronto! O ícone de escudo do ProjectLens estará ativo na sua barra de extensões.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <a 
            href="https://github.com/leonardoferreira21/ProjectLens" 
            target="_blank" 
            rel="noreferrer" 
            className="btn-secondary"
          >
            <span>Acessar no GitHub</span>
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
