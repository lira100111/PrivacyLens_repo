# ProjectLens — Chrome Extension (Manifest V3 + React 19)

Extensão de navegador para **Auditoria Técnica de Privacidade, Segurança e LGPD**, desenvolvida com **React 19**, **TypeScript**, **Vite** e **@crxjs/vite-plugin** seguindo as diretrizes do Manifest V3.

---

## 🚀 Como Executar em Desenvolvimento

### 1. Pré-requisitos
* Node.js v20+ e npm instalados.

### 2. Iniciar o Servidor de Desenvolvimento (com HMR)
```bash
npm run dev
```

### 3. Carregar no Google Chrome
1. Abra o navegador Chrome e acesse `chrome://extensions`.
2. No canto superior direito, ative o **Modo do desenvolvedor** (Developer mode).
3. Clique no botão **Carregar sem compactação** (Load unpacked).
4. Selecione a pasta `dist` gerada no diretório `lens-extension`.

---

## 🛠️ Comandos Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor Vite com Hot Module Reloading para extensão Chrome. |
| `npm run build` | Valida TypeScript (`tsc`) e gera os arquivos finais de produção na pasta `dist/`. |
| `npm run preview` | Pré-visualização do build. |

---

## 📁 Estrutura do Projeto

```
lens-extension/
├── dist/                      # Saída do build pronta para carregar no Chrome
├── public/                    # Ícones e recursos estáticos da extensão
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── src/
│   ├── background/            # Service Worker headless (Manifest V3)
│   │   ├── index.ts           # Roteamento de mensagens IPC e ciclo de vida
│   │   ├── evidence-manager.ts# Cadeia criptográfica SHA-256 e storage sync
│   │   └── collectors/        # Coletores de cookies e rede
│   │       ├── cookies.ts     # Snapshot e listener de chrome.cookies
│   │       └── network.ts     # Inspeciona cabeçalhos de segurança e 3rd-parties
│   ├── content/               # Content Script injetado no DOM da página
│   │   └── index.ts           # Detecção de CMPs, cliques de consentimento e storage
│   ├── sidepanel/             # Painel Lateral interativo em React 19
│   │   ├── index.html         # Ponto de entrada do Side Panel
│   │   ├── main.tsx           # Bootstrap do React
│   │   ├── App.tsx            # Dashboard de auditoria completo (Tabs, Métricas, Hashes)
│   │   ├── components/
│   │   │   └── RiskNote.tsx   # Selo e explicação de risco de cada item (RF17)
│   │   └── index.css          # Estilização moderna e responsiva
│   ├── hooks/                 # Hooks React customizados
│   │   └── useAuditSession.ts # Sincronização em tempo real com o background e storage
│   └── shared/                # Tipos, criptografia e constantes compartilhadas
│       ├── types.ts           # Interfaces TypeScript do modelo de evidência e IPC
│       ├── crypto.ts          # Serialização canônica e cálculo de SHA-256
│       ├── risk-analysis.ts   # Heurísticas de risco explicáveis por item coletado (RF17)
│       └── constants.ts       # Seletores de CMPs e chaves de armazenamento
├── manifest.config.ts         # Configuração tipada do Manifest V3
├── vite.config.ts             # Configuração do Vite com @crxjs/vite-plugin
├── tsconfig.json              # Configuração do compilador TypeScript
└── package.json
```

---

## 🔒 Metodologia e Integridade Criptográfica (SHA-256)

1. **Evidência Estruturada:** Cada ação (coleta de cookie, clique em consentimento, requisição de terceiro, cabeçalho inspecionado) gera um evento JSON imutável.
2. **Cadeia de Hashes:** Cada evento calcula seu hash:
   $$\text{Hash}_n = \text{SHA-256}(\text{Canônico}(E_n) + \text{Hash}_{n-1})$$
3. **Verificação Instantânea:** O painel conta com o botão **"Verificar Integridade"**, que percorre toda a cadeia conferindo se houve adulteração em qualquer evento anterior.
4. **Explicação de Riscos (RF17):** Cada item coletado (consentimento, cookies, storage, rede, cabeçalhos de segurança e eventos da cadeia) mostra um selo de risco com uma explicação breve sobre se ele representa risco para o usuário. As avaliações são calculadas na interface e não alteram a cadeia de hashes. Detalhes em [`docs/modules/risk-analysis.md`](docs/modules/risk-analysis.md).
5. **Exportação de Relatório:** Exporta a sessão integral com histórico, dados técnicos e hashes em formato JSON para auditorias externas.
