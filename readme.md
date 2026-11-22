# Plano de Ação — Extensão de Navegador para Auditoria Técnica de Privacidade, Segurança e LGPD

*Documento de estudo, planejamento e implementação do protótipo de alta fidelidade*

**Objetivo central:** desenvolver uma extensão Chrome capaz de observar o comportamento de uma página durante a navegação, coletar evidências técnicas relacionadas a cookies, armazenamento, requisições, terceiros, consentimento e mecanismos de segurança, e apresentar os resultados de forma explicável e auditável.

---

## 1. Visão do projeto

O produto deve ser tratado como uma ferramenta de auditoria técnica e coleta de evidências, e não como um sistema que declara automaticamente que uma empresa está ou não em conformidade com a LGPD. A extensão deve distinguir claramente entre fato observado, interpretação técnica e indicador relacionado à proteção de dados.

Exemplo: "O cookie X foi criado após a escolha 'Rejeitar'" é uma evidência observável. "Esse comportamento pode ser incompatível com a escolha de consentimento" é uma interpretação técnica. A conclusão jurídica depende do contexto e não deve ser automatizada de maneira absoluta.

---

## 2. Escopo recomendado para o MVP

| Módulo | Função principal |
|---|---|
| Consentimento | Detectar banner/opções e registrar ações observadas de aceitar/rejeitar quando possível. |
| Cookies | Coletar cookies, atributos e momento de criação/alteração; comparar estados antes/depois do consentimento. |
| Storage | Observar localStorage/sessionStorage e outros mecanismos acessíveis à extensão. |
| Rede | Registrar requisições relevantes e domínios de terceiros; identificar padrões de rastreamento. |
| Segurança | Verificar HTTPS e cabeçalhos como CSP, HSTS, X-Content-Type-Options, Referrer-Policy e Permissions-Policy. |
| Evidências | Gerar eventos estruturados com URL, timestamp, tipo, contexto e dados técnicos necessários. |
| Integridade | Aplicar SHA-256 e, depois, cadeia de hashes para detectar alteração dos eventos. |
| Dashboard | Exibir indicadores, alertas, evidências e metodologia de forma compreensível. |
| Exportação | Exportar relatório JSON; PDF pode ser uma etapa posterior. |

---

## 3. O que estudar antes e durante a implementação

- **JavaScript moderno:** const/let, funções, módulos, objetos, arrays, JSON, Promises, async/await, eventos e tratamento de erros.
- **HTML/CSS:** estrutura semântica, formulários, Flexbox/Grid, responsividade e construção do dashboard.
- **Chrome Extensions / Manifest V3:** manifest.json, service worker, content scripts, permissions, APIs de cookies, tabs, storage e webRequest/declarativeNetRequest conforme a necessidade e as limitações atuais.
- **Web APIs:** Fetch, Storage API, Web Crypto API e conceitos de origem, domínio, cookies e políticas do navegador.
- **HTTP/HTTPS:** métodos, status codes, headers, TLS, cookies e ciclo requisição/resposta.
- **Privacidade na web:** cookies, localStorage, fingerprinting, trackers, pixels, third parties, analytics, session replay e consentimento.
- **LGPD:** princípios, bases legais, consentimento, transparência, finalidade, necessidade, direitos dos titulares e segurança. Use fontes oficiais da ANPD para fundamentar regras.
- **Segurança web:** CSP, HSTS, SameSite, Secure, HttpOnly, X-Content-Type-Options, Referrer-Policy e riscos comuns. SQL injection/XSS devem ser estudados conceitualmente, mas não precisam entrar como testes ativos no MVP.
- **Criptografia aplicada:** SHA-256, hash, cadeia de hashes, canonicalização de JSON e diferença entre integridade, autenticidade e prova de ocorrência.
- **Engenharia de software:** Git, commits pequenos, testes, documentação, arquitetura modular, versionamento e rastreabilidade de requisitos.

---

## 4. Linguagens e tecnologias

| Tecnologia | Uso |
|---|---|
| JavaScript | Lógica da extensão, coleta, regras, eventos e hash. |
| HTML | Popup/dashboard e telas de evidência. |
| CSS | Interface e visualização dos resultados. |
| Chrome Extension Manifest V3 | Plataforma da extensão. |
| Web Crypto API | SHA-256 e integridade. |
| JSON | Formato inicial de eventos e exportação. |
| Git/GitHub ou GitLab | Versionamento e documentação do desenvolvimento. |
| PHP + MariaDB (futuro) | API, armazenamento histórico e painel web, caso o projeto evolua para arquitetura cliente-servidor. |

---

## 5. Levantamento de requisitos

### 5.1 Requisitos funcionais

1. **RF01** — Identificar a página/URL que está sendo auditada.
2. **RF02** — Iniciar e encerrar uma sessão de auditoria.
3. **RF03** — Registrar eventos observáveis durante a sessão.
4. **RF04** — Coletar informações de cookies disponíveis pelas APIs permitidas.
5. **RF05** — Registrar atributos relevantes de cookies: domínio, caminho, Secure, HttpOnly, SameSite, expiração e contexto disponível.
6. **RF06** — Observar mecanismos de armazenamento acessíveis e registrar alterações relevantes.
7. **RF07** — Registrar requisições/domínios de terceiros quando tecnicamente possível.
8. **RF08** — Detectar ou auxiliar a identificação de ações de consentimento.
9. **RF09** — Comparar o estado observado antes e depois de aceitar/rejeitar.
10. **RF10** — Aplicar regras técnicas e gerar alertas explicáveis.
11. **RF11** — Criar evidências estruturadas para cada evento relevante.
12. **RF12** — Calcular hash SHA-256 das evidências.
13. **RF13** — Manter cadeia de hashes com previous_hash/current_hash.
14. **RF14** — Verificar a integridade da cadeia.
15. **RF15** — Exibir resultados em dashboard.
16. **RF16** — Exportar a sessão de auditoria em JSON.
17. **RF17** — Exibir uma breve explicação sobre os eventos coletados informando ao usuário se o que foi coletado representa algum risco para segurança para o usuário.

### 5.2 Requisitos não funcionais

1. **RNF01** — A extensão deve minimizar coleta de dados pessoais e evitar armazenar conteúdo desnecessário.
2. **RNF02** — O usuário deve saber quando uma auditoria está ativa.
3. **RNF03** — Os resultados devem ser explicáveis e rastreáveis até uma evidência.
4. **RNF04** — O código deve ser modular para permitir evolução futura.
5. **RNF05** — A interface deve funcionar em diferentes tamanhos de tela.
6. **RNF06** — O sistema deve tratar falhas de APIs e páginas sem interromper toda a auditoria.
7. **RNF07** — O relatório deve informar limitações técnicas e não apresentar conclusões jurídicas absolutas.
8. **RNF08** — Eventos devem possuir timestamp e identificador único.
9. **RNF09** — O mecanismo de hash deve ser determinístico e verificável.
10. **RNF10** — Permissões do Manifest devem seguir o princípio do menor privilégio possível.

---

## 6. Arquitetura sugerida

```
Chrome Extension
├── background/
│   └── service-worker.js
├── collectors/
│   ├── cookies.js
│   ├── storage.js
│   ├── network.js
│   └── security.js
├── content/
│   └── consent-detector.js
├── rules/
│   ├── cookies.js
│   ├── consent.js
│   └── security.js
├── evidence/
│   └── evidence-manager.js
├── crypto/
│   └── hash.js
├── dashboard/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
└── reports/
    └── report.js
```

---

## 7. Modelo de evidência

Cada evento deve ser tratado como um objeto estruturado. Exemplo conceitual:

```json
{
  "site": "",
  "url": "",
  "timestamp": "",
  "event_type": "",
  "consent_state": "",
  "data": {},
  "previous_hash": "",
  "hash": ""
}
```

O hash deve ser calculado sobre uma representação canônica e estável do evento. Na cadeia:

- H1 = SHA-256(E1)
- H2 = SHA-256(E2 + H1)
- H3 = SHA-256(E3 + H2)

A cadeia aumenta a capacidade de detectar alteração de eventos anteriores. **Importante:** hash comprova correspondência entre conteúdo e digest; não comprova sozinho que o evento realmente ocorreu nem quem o produziu.

---

## 8. Regras e interpretação

Estruture cada regra em três camadas: **observação → interpretação técnica → referência normativa/metodológica**.

Por exemplo: "cookie criado após rejeição" → "cookie persistente/terceiro observado após a ação" → "indicador que merece análise quanto à finalidade e à base legal". Isso evita transformar uma heurística em uma decisão jurídica automática.

Mantenha as regras em arquivos separados do código de coleta. Assim, uma futura alteração na metodologia não exige reescrever a extensão inteira.

---

## 9. Plano de implementação — 8 semanas

| Semana | Entregável |
|---|---|
| 1 | Requisitos, escopo, arquitetura, Git, documentação inicial e desenho da interface. |
| 2 | Manifest V3, popup, service worker, permissões e primeiro evento de teste. |
| 3 | Coletor de cookies + modelo de evidência + armazenamento local. |
| 4 | Storage + rede + identificação de terceiros + primeiros testes. |
| 5 | Detecção/registro de consentimento + comparação antes/depois. |
| 6 | Cabeçalhos e indicadores de segurança + motor de regras. |
| 7 | SHA-256 + cadeia de hashes + dashboard + exportação JSON. |
| 8 | Testes, correções, casos de uso, documentação, limitações, apresentação e versão final. |

---

## 10. Como documentar o projeto

- **README.md:** objetivo, instalação, execução, estrutura de pastas e limitações.
- **Documento de requisitos:** RF/RNF, casos de uso e critérios de aceitação.
- **Arquitetura:** diagrama da extensão e fluxo dos eventos.
- **Metodologia:** explicar como cada indicador é calculado e quais evidências o sustentam.
- **Diário técnico:** decisões importantes, problemas encontrados e soluções.
- **Testes:** registrar site, cenário, ação executada, comportamento observado e resultado esperado/obtido.
- **Threat model:** documentar o que pode ser falsificado, alterado ou perdido e como a extensão reduz esses riscos.
- **Privacidade da própria ferramenta:** documentar quais dados a extensão coleta, onde ficam e por quanto tempo.
- **Versões:** usar tags/releases como v0.1, v0.2, v1.0.

---

## 11. Estrutura de testes

Monte um conjunto de páginas controladas por você. Crie cenários como: página sem banner; banner com aceitar/rejeitar; cookie essencial; cookie de terceiro; cookie criado antes do consentimento; cookie criado depois de rejeição; cabeçalhos presentes/ausentes; múltiplos terceiros; armazenamento local alterado. Para cada cenário, defina o resultado esperado. Isso é mais confiável do que testar apenas sites reais.

---

## 12. O que NÃO colocar no MVP

- Testes ativos de SQL Injection, XSS ou exploração de vulnerabilidades.
- Crawler de grandes volumes de sites.
- Blockchain.
- IA complexa para classificar todo o comportamento da web.
- Backend obrigatório antes de validar o núcleo da extensão.
- Pontuação jurídica que diga simplesmente "aprovado/reprovado pela LGPD".
- Coleta indiscriminada de conteúdo ou dados pessoais.

---

## 13. Possíveis evoluções depois do protótipo

Depois que o núcleo estiver estável, a arquitetura pode evoluir para: API própria → PHP → MariaDB → painel web → histórico de auditorias → comparação entre versões → monitoramento periódico → metodologia mais sofisticada de classificação → integração com fontes normativas.

O mecanismo de hash pode evoluir para ancoragem externa/timestamping, caso exista uma necessidade concreta de demonstrar integridade fora do dispositivo do usuário.

---

## 14. Cuidados científicos e jurídicos

A pesquisa deve citar fontes oficiais e literatura acadêmica. Para LGPD, priorize a ANPD e o texto legal vigente. Para APIs e segurança do navegador, use a documentação oficial do Chrome/Chromium e padrões reconhecidos. Para afirmações sobre novidade/patente, faça busca específica de anterioridade em bases como INPI, WIPO/Patentscope, Google Patents e literatura científica; uma busca preliminar não substitui análise profissional de propriedade intelectual.

Também registre as limitações: APIs do navegador não expõem tudo; banners podem ser implementados de maneiras diferentes; algumas decisões dependem de contexto jurídico; e a extensão observa o comportamento disponível ao navegador, não necessariamente toda a infraestrutura do controlador.

---

## 15. Checklist de conclusão

- [ ] Extensão instala e inicia corretamente.
- [ ] Auditoria pode ser iniciada/encerrada.
- [ ] Eventos são coletados e armazenados.
- [ ] Cookies e terceiros são observados.
- [ ] Consentimento pode ser registrado nos cenários suportados.
- [ ] Comparação antes/depois funciona.
- [ ] Regras produzem alertas explicáveis.
- [ ] Evidências possuem timestamp e identificador.
- [ ] SHA-256 funciona.
- [ ] Cadeia de hashes pode ser verificada.
- [ ] Dashboard apresenta evidências, não apenas uma nota.
- [ ] JSON pode ser exportado.
- [ ] Casos de teste documentados.
- [ ] Limitações documentadas.
- [ ] Código versionado.
- [ ] Apresentação consegue explicar arquitetura, metodologia e resultados.

**Estratégia recomendada:** construa primeiro um núcleo pequeno que consiga observar um evento, transformá-lo em evidência, gerar SHA-256 e exibir o resultado. Depois conecte cookies, consentimento, rede e segurança. Essa ordem reduz risco e permite ter um protótipo funcional mesmo se alguma parte mais complexa atrasar.

---

*Documento preparado como plano técnico de estudo e desenvolvimento. Tecnologias e APIs de navegador devem ser conferidas na documentação atual durante a implementação.*


https://privacy-lens-repo.vercel.app/#faq
