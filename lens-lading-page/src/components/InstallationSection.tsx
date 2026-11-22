import React, { useState } from 'react';
import { 
  Download, 
  Check, 
  Copy, 
  ExternalLink
} from 'lucide-react';
import { ChromeIcon } from './Icons';

interface InstallationSectionProps {
  onOpenModal: () => void;
}

const REPO_URL = 'https://github.com/lira100111/PrivacyLens_repo';
const RELEASES_URL = 'https://github.com/lira100111/PrivacyLens_repo/releases';
const RELEASE_FILE = 'PrivacyLens_1.0.0.zip';

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
          Instale o PrivacyLens em Menos de 2 Minutos
        </h2>
        <p className="section-subtitle">
          Baixe a release pronta para uso e carregue no Google Chrome, Brave, Edge ou qualquer navegador Chromium — sem precisar instalar dependências.
        </p>
      </div>

      <div className="install-grid">
        {/* Method 1: GitHub Release (Unpacked) */}
        <div className="install-card active-method">
          <div className="install-card-badge">Recomendado • Versão 1.0.0</div>
          <div className="install-card-header">
            <Download size={22} className="text-cyan" />
            <div>
              <h3>Instalação via Release do GitHub (Sem Compactação)</h3>
              <p>Baixe o pacote compilado e carregue diretamente no navegador.</p>
            </div>
          </div>

          <div className="install-steps-list">
            <div className="install-step-item">
              <div className="step-badge">1</div>
              <div className="step-info">
                <strong>Baixe a release oficial no GitHub</strong>
                <p className="text-xs text-muted mt-1">
                  Acesse as releases do repositório{' '}
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="install-inline-link"
                  >
                    lira100111/PrivacyLens_repo
                  </a>{' '}
                  e baixe o arquivo <code>{RELEASE_FILE}</code>.
                </p>
                <div className="install-step-actions">
                  <a
                    href={RELEASES_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-install-download"
                  >
                    <Download size={14} />
                    <span>Baixar {RELEASE_FILE} nas Releases</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>

            <div className="install-step-item">
              <div className="step-badge">2</div>
              <div className="step-info">
                <strong>Descompacte o arquivo {RELEASE_FILE}</strong>
                <p className="text-xs text-muted mt-1">
                  Extraia o conteúdo de <code>{RELEASE_FILE}</code> em uma pasta no seu computador.
                </p>
              </div>
            </div>

            <div className="install-step-item">
              <div className="step-badge">3</div>
              <div className="step-info">
                <strong>Carregue a extensão sem compactação no Google Chrome</strong>
                <div className="code-box">
                  <code>chrome://extensions</code>
                  <button 
                    className="btn-copy" 
                    onClick={() => copyToClipboard('chrome://extensions', 1)}
                    title="Copiar endereço"
                  >
                    {copiedIndex === 1 ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                  </button>
                </div>
                <p className="text-xs text-muted mt-2">
                  1. Abra <code>chrome://extensions</code> no navegador.<br />
                  2. Ative a chave <strong>"Modo do desenvolvedor"</strong> (canto superior direito).<br />
                  3. Clique em <strong>"Carregar sem compactação"</strong> e selecione a pasta extraída de <code>{RELEASE_FILE}</code>.
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
              O PrivacyLens está em fase de revisão final para publicação na Chrome Web Store.
              Enquanto isso, você já pode baixar a versão pronta (<code>{RELEASE_FILE}</code>) diretamente nas releases do GitHub.
            </p>

            <div className="store-buttons">
              <a 
                href={RELEASES_URL} 
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
