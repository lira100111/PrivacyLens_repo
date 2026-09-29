import React, { useState } from 'react';
import { 
  Download, 
  Terminal, 
  Check, 
  Copy, 
  FolderCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ChromeIcon } from './Icons';

interface InstallationSectionProps {
  onOpenModal: () => void;
}

export const InstallationSection: React.FC<InstallationSectionProps> = ({ onOpenModal }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section id="instalacao" className="installation-section">
      <div className="section-header">
        <div className="section-badge">
          <Download size={14} />
          <span>Comece Agora</span>
        </div>
        <h2 className="section-title">
          Instale o ProjectLens em Menos de 2 Minutos
        </h2>
        <p className="section-subtitle">
          Disponível em código aberto para carregar no Google Chrome, Brave, Edge ou qualquer navegador Chromium.
        </p>
      </div>

      <div className="install-grid">
        {/* Method 1: Developer Mode Build */}
        <div className="install-card active-method">
          <div className="install-card-badge">Recomendado para Testes Imediatos</div>
          <div className="install-card-header">
            <Terminal size={22} className="text-cyan" />
            <div>
              <h3>Instalação via Código Fonte (Modo Desenvolvedor)</h3>
              <p>Execute localmente em seu próprio ambiente com build auditável.</p>
            </div>
          </div>

          <div className="install-steps-list">
            <div className="install-step-item">
              <div className="step-badge">1</div>
              <div className="step-info">
                <strong>Clone o repositório oficial</strong>
                <div className="code-box">
                  <code>git clone https://github.com/leonardoferreira21/ProjectLens.git</code>
                  <button 
                    className="btn-copy" 
                    onClick={() => copyToClipboard('git clone https://github.com/leonardoferreira21/ProjectLens.git', 1)}
                    title="Copiar comando"
                  >
                    {copiedIndex === 1 ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="install-step-item">
              <div className="step-badge">2</div>
              <div className="step-info">
                <strong>Instale as dependências e faça o build do Manifest V3</strong>
                <div className="code-box">
                  <code>cd ProjectLens/lens-extension && npm install && npm run build</code>
                  <button 
                    className="btn-copy" 
                    onClick={() => copyToClipboard('cd ProjectLens/lens-extension && npm install && npm run build', 2)}
                    title="Copiar comando"
                  >
                    {copiedIndex === 2 ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="install-step-item">
              <div className="step-badge">3</div>
              <div className="step-info">
                <strong>Carregue a pasta no Google Chrome</strong>
                <p className="text-xs text-muted mt-1">
                  1. Abra <code>chrome://extensions</code> no navegador.<br />
                  2. Ative a chave <strong>"Modo do desenvolvedor"</strong> (canto superior direito).<br />
                  3. Clique em <strong>"Carregar sem compactação"</strong> e selecione a pasta <code>lens-extension/dist</code>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Method 2: Chrome Web Store (Pre-release) */}
        <div className="install-card">
          <div className="install-card-badge store-badge">Em Breve na Store</div>
          <div className="install-card-header">
            <ChromeIcon size={22} className="text-emerald" />
            <div>
              <h3>Chrome Web Store (Lançamento Oficial)</h3>
              <p>Instalação com 1 clique diretamente pelo catálogo do Google Chrome.</p>
            </div>
          </div>

          <div className="store-callout">
            <p className="text-sm">
              O ProjectLens está em fase de revisão final para publicação na Chrome Web Store.
              Inscreva-se ou acompanhe os lançamentos no GitHub para ser notificado assim que o link estiver ativo.
            </p>

            <div className="store-buttons">
              <a 
                href="https://github.com/leonardoferreira21/ProjectLens/releases" 
                target="_blank" 
                rel="noreferrer" 
                className="btn-outline-store"
              >
                <span>Ver Releases no GitHub</span>
                <ExternalLink size={14} />
              </a>

              <button 
                className="btn-store-disabled"
                onClick={onOpenModal}
              >
                <ChromeIcon size={16} />
                <span>Ver Instruções Detalhadas</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
