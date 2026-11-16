import React from 'react';
import { Shield, FileText, Lock, Heart, ExternalLink } from 'lucide-react';
import { GithubIcon } from './Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <div className="footer-brand">
            <div className="brand-logo-glow">
              <Shield size={20} className="brand-icon" />
            </div>
            <span className="brand-title">
              Privacy<span className="accent-text">Lens</span>
            </span>
          </div>
          <p className="footer-bio">
            Extensão open-source de auditoria técnica para transparência, segurança e privacidade na web moderna.
            Construído para profissionais de dados, desenvolvedores e advogados digitais.
          </p>
          <div className="footer-socials">
            <a 
              href="https://github.com/leonardoferreira21/ProjectLens" 
              target="_blank" 
              rel="noreferrer" 
              className="social-btn"
              title="GitHub"
            >
              <GithubIcon size={18} />
              <span>leonardoferreira21/ProjectLens</span>
            </a>
          </div>
        </div>

        {/* Links Column 1: Projeto */}
        <div className="footer-col">
          <h4 className="footer-col-title">Navegação</h4>
          <ul className="footer-links">
            <li><a href="#simulador">Simulador ao Vivo</a></li>
            <li><a href="#modulos">Módulos de Auditoria</a></li>
            <li><a href="#metodologia">Cadeia SHA-256</a></li>
            <li><a href="#para-quem">Casos de Uso</a></li>
            <li><a href="#comparativo">Comparativo</a></li>
            <li><a href="#faq">Perguntas Frequentes</a></li>
          </ul>
        </div>

        {/* Links Column 2: Documentação */}
        <div className="footer-col">
          <h4 className="footer-col-title">Documentação Técnica</h4>
          <ul className="footer-links">
            <li>
              <a 
                href="https://github.com/leonardoferreira21/ProjectLens/blob/main/readme.md" 
                target="_blank" 
                rel="noreferrer"
              >
                Plano de Ação LGPD
                <ExternalLink size={12} className="inline-icon" />
              </a>
            </li>
            <li>
              <a 
                href="https://github.com/leonardoferreira21/ProjectLens/blob/main/lens-extension/docs/architecture.md" 
                target="_blank" 
                rel="noreferrer"
              >
                Arquitetura Manifest V3
                <ExternalLink size={12} className="inline-icon" />
              </a>
            </li>
            <li>
              <a 
                href="https://github.com/leonardoferreira21/ProjectLens/blob/main/lens-extension/docs/permissions.md" 
                target="_blank" 
                rel="noreferrer"
              >
                Matriz de Permissões
                <ExternalLink size={12} className="inline-icon" />
              </a>
            </li>
            <li>
              <a 
                href="https://github.com/leonardoferreira21/ProjectLens/blob/main/lens-extension/README.md" 
                target="_blank" 
                rel="noreferrer"
              >
                Guia de Instalação Local
                <ExternalLink size={12} className="inline-icon" />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Garantias de Privacidade */}
        <div className="footer-col">
          <h4 className="footer-col-title">Compromisso</h4>
          <div className="privacy-pledge-card">
            <Lock size={16} className="text-emerald" />
            <p className="text-xs">
              <strong>100% Client-Side:</strong> Sem envio de logs, sem coleta de telemetria externa, sem cookies da landing page.
            </p>
          </div>
          <p className="text-xs text-muted mt-3">
            Licenciado sob a <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noreferrer" className="underline">Licença MIT</a>.
          </p>
        </div>
      </div>

      {/* Legal Disclaimer Box */}
      <div className="legal-disclaimer">
        <p>
          <strong>Aviso Metodológico & Legal:</strong> O PrivacyLens é uma ferramenta técnica de observação, coleta de evidências e apoio à auditoria. 
          As evidências registradas não constituem declaração judicial definitiva de regularidade ou infração à Lei Geral de Proteção de Dados (LGPD) ou GDPR, 
          cuja análise depende da base legal, da finalidade e da interpretação do contexto pelo profissional competente ou autoridade reguladora (ANPD).
        </p>
      </div>

      <div className="footer-bottom">
        <div>
          © {new Date().getFullYear()} PrivacyLens. Desenvolvido para transparência e privacidade na web.
        </div>
        <div className="flex items-center gap-1">
          <span>Construído com React 19 & TypeScript</span>
        </div>
      </div>
    </footer>
  );
};
