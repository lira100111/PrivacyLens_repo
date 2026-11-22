# PrivacyLens — Landing Page Oficial

Landing page oficial do **PrivacyLens**, projetada para divulgar o projeto, educar novos usuários sobre auditoria técnica de privacidade e LGPD, e disponibilizar instruções de instalação da extensão Google Chrome.

---

## 🌟 Destaques da Landing Page

1. **Simulador Interativo ao Vivo:** Demonstração funcional no próprio navegador com uma réplica fiel do **Side Panel** da extensão PrivacyLens (Visão Geral, Consentimento, Cookies, Rede, Segurança HTTP e Cadeia SHA-256).
2. **Banner CMP Interativo:** Permite que o visitante clique em "Aceitar Todos" ou "Rejeitar Não Essenciais" e veja as mutações de cookies e disparos de terceiros em tempo real.
3. **Verificador de Integridade Criptográfica (SHA-256):** Botão interativo que simula a validação dos hashes de evidências ponta a ponta.
4. **Modal e Seção de Instalação Rápida:** Passo a passo para baixar a release (`PrivacyLens_1.0.0.zip`), descompactar e carregar sem compactação no Google Chrome ou navegadores Chromium.
5. **Tabela Comparativa:** Demonstra com clareza os diferenciais frente a adblockers genéricos, scanners remotos SaaS e DevTools manual.
6. **Perguntas Frequentes (FAQ):** Esclarece dúvidas cruciais sobre privacidade (zero telemetria), limitações técnicas e separação entre fatos observados e pareceres jurídicos.

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
* Node.js v20+ e npm.

### 2. Instalação e Desenvolvimento
```bash
# Entrar no diretório
cd lens-lading-page

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento Vite
npm run dev
```
O servidor estará acessível em `http://localhost:3000`.

### 3. Build para Produção
```bash
npm run build
```
Os arquivos estáticos otimizados serão gerados na pasta `dist/`, prontos para serem hospedados em qualquer CDN, VPS, GitHub Pages, Vercel ou Cloudflare Pages.

---

## 🛠️ Tecnologias Utilizadas

* **React 19**
* **TypeScript**
* **Vite**
* **Lucide React** (Ícones SVG consistentes com a extensão)
* **CSS Puro com Variáveis Modernas & Glassmorphism** (Zero dependências pesadas de CSS)

---

## 📂 Estrutura de Arquivos

```
lens-lading-page/
├── index.html                  # HTML base com fontes e tags OpenGraph/SEO
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx                # Ponto de entrada React
│   ├── App.tsx                 # Composição das seções da landing page
│   ├── index.css               # Design system e tokens visuais
│   └── components/
│       ├── Navbar.tsx          # Barra de navegação com links rápidos e CTAs
│       ├── Hero.tsx            # Headline de alto impacto e métricas-chave
│       ├── InteractiveSimulator.tsx # Simulador interativo do Side Panel e CMP
│       ├── ValueProps.tsx      # Metodologia explicável, SHA-256 e zero telemetria
│       ├── ModulesSection.tsx  # Visão detalhada dos coletores da extensão
│       ├── HowItWorks.tsx      # Fluxo de auditoria em 4 passos simples
│       ├── TargetAudience.tsx  # Personas (DPOs, Devs, Advogados, Pesquisadores)
│       ├── ComparisonTable.tsx # Tabela comparativa PrivacyLens vs Alternativas
│       ├── InstallationSection.tsx # Comandos de instalação e status na Store
│       ├── InstallationModal.tsx # Modal interativo com passo a passo
│       ├── FaqSection.tsx      # Tira-dúvidas interativo (accordion)
│       └── Footer.tsx          # Rodapé com disclaimer jurídico e links técnicos
```
