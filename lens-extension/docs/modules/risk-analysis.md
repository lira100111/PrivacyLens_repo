# Módulo de Análise de Risco (RF17)

Implementado em [`src/shared/risk-analysis.ts`](../../src/shared/risk-analysis.ts) e exibido pelo componente [`RiskNote`](../../src/sidepanel/components/RiskNote.tsx).

Para cada item coletado, o painel mostra um **selo de risco** (`Sem risco`, `Risco baixo`, `Risco médio`, `Risco alto`) e uma **frase curta** explicando, em linguagem acessível, se o item representa risco à segurança ou à privacidade do usuário. O link **"Por que?"** abre os demais motivos e uma recomendação de **"O que fazer"**.

> **Fato × interpretação:** as avaliações são calculadas na interface a partir da sessão e **não são gravadas na cadeia de evidências**. Assim os hashes SHA-256 continuam cobrindo só fatos observados. A classificação é heurística e não substitui um parecer jurídico.

## Linha do tempo de consentimento

`consentDecisionAt()` descobre qual era a decisão de consentimento (`ACCEPTED_ALL`, `REJECTED_ALL`, `CUSTOMIZED` ou nenhuma) no instante em que cada cookie ou requisição foi observado. A mesma evidência recebe um nível diferente conforme esse contexto:

| Rastreador observado… | Nível |
|---|---|
| antes de qualquer escolha | Alto |
| que já existia no snapshot inicial (até 3 s após o início) | Médio (pode vir de um consentimento dado em visita anterior) |
| depois de **Rejeitar** | Alto (a escolha pode não estar sendo respeitada) |
| depois de **Aceitar** / **Personalizar** | Médio |

## Regras por aba

| Aba | Principais regras |
|---|---|
| **Consentimento** | Avaliação geral (houve rastreamento antes da escolha? existe banner?) e, para cada evento, contagem de cookies e serviços de rastreamento ativados até a próxima decisão. |
| **Cookies** | Rastreadores conhecidos (`_ga`, `_fbp`, `_hj*`, …), cookie de terceiro, cookie de sessão sem `Secure`/`HttpOnly`, `SameSite=None` e validade acima de 13 meses. |
| **Armazenamento** | Tokens ou credenciais em `localStorage`/`sessionStorage`, possíveis dados pessoais, identificadores de analytics e itens volumosos. |
| **Rede** | Domínios de rastreamento e publicidade, tráfego HTTP sem TLS, dados pessoais ou identificadores únicos na URL, CDNs (risco baixo) e terceiros não classificados. |
| **Segurança** | CSP (ausente ou com `unsafe-inline`/`unsafe-eval`), HSTS (ausente ou `max-age` < 180 dias), `nosniff`, `Referrer-Policy`, `Permissions-Policy` e página servida sem HTTPS. |
| **Cadeia** | Explicação de cada `EvidenceEvent` reaproveitando as regras acima, mais o estado de integridade da cadeia (não verificada, íntegra ou violada). |

A **Visão Geral** junta tudo em `buildSessionRiskReport()`, com uma entrada por cookie, chave de storage, domínio de terceiro e cabeçalho, e lista os riscos médios e altos.

## Como estender

As bases de conhecimento (`TRACKER_DOMAINS`, `TRACKER_COOKIES`, `CDN_DOMAINS` e as expressões regulares de chaves sensíveis) são listas simples no topo do módulo. Para incluir um novo rastreador, basta adicionar uma entrada com `name` e `category`.
