import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  ShieldQuestion
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'O PrivacyLens envia meus dados ou histórico para algum servidor externo?',
      answer: 'Não. Absolutamente nenhum dado sai do seu computador. O PrivacyLens foi construído sob o princípio da privacidade por design: opera 100% no cliente utilizando as APIs do navegador (chrome.cookies, chrome.webRequest, chrome.storage.local). Não existe telemetria oculta, nem servidores remotos que recebam os sites que você visita.'
    },
    {
      question: 'O PrivacyLens substitui um parecer jurídico ou declara irregularidade na LGPD?',
      answer: 'Não. O PrivacyLens é uma ferramenta técnica de coleta e auditoria de evidências. Ele se abstém rigorosamente de emitir vereditos jurídicos automáticos. A extensão distingue claramente entre: Fato Observado (ex: "cookie de marketing gravado após clique no botão rejeitar"), Interpretação Técnica e Indicador Normativo. A conclusão jurídica depende do contexto, base legal e análise de um profissional qualificado ou da ANPD.'
    },
    {
      question: 'Como funciona a cadeia criptográfica de integridade SHA-256?',
      answer: 'Cada evento da auditoria é serializado em JSON de forma canônica (com chaves ordenadas alfabeticamente para evitar variações de encoding). Em seguida, calcula-se o hash SHA-256 do evento em conjunto com o hash do evento anterior (Hash_n = SHA-256(Evento_n + Hash_n-1)). Essa estrutura em cadeia garante matematicamente que nenhum registro pretérito foi editado ou forjado manualmente.'
    },
    {
      question: 'Quais navegadores são suportados?',
      answer: 'O PrivacyLens foi desenvolvido no padrão Manifest V3 com Side Panel API. Ele funciona nativamente no Google Chrome, Brave, Microsoft Edge, Opera, Vivaldi e qualquer navegador moderno baseado no ecossistema Chromium.'
    },
    {
      question: 'A extensão interfere no funcionamento ou na velocidade dos sites auditados?',
      answer: 'Não. O PrivacyLens atua de modo puramente observacional e passivo durante a sessão de auditoria. Ele não bloqueia requisições em tempo de execução nem injeta scripts pesados que alterem a renderização ou velocidade da página.'
    },
    {
      question: 'O projeto é gratuito e de código aberto?',
      answer: 'Sim, o PrivacyLens é 100% open-source sob a licença permissiva MIT. O código fonte completo está disponível no repositório do GitHub para ser inspecionado, validado e estendido por toda a comunidade de segurança e privacidade.'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq-section">
      <div className="section-header">
        <div className="section-badge">
          <HelpCircle size={14} />
          <span>Tira-Dúvidas</span>
        </div>
        <h2 className="section-title">
          Perguntas Frequentes sobre o PrivacyLens
        </h2>
        <p className="section-subtitle">
          Entenda as garantias de privacidade, o funcionamento da integridade criptográfica e os limites metodológicos da ferramenta.
        </p>
      </div>

      <div className="faq-list">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              className={`faq-item ${isOpen ? 'open' : ''}`}
            >
              <button 
                className="faq-question-btn" 
                onClick={() => toggleFaq(idx)}
                aria-expanded={isOpen}
              >
                <span className="faq-question-text">{faq.question}</span>
                <span className="faq-toggle-icon">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>

              {isOpen && (
                <div className="faq-answer-content">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
