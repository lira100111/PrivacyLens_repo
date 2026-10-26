# Módulo de Coletores e Heurísticas de Análise

Este documento detalha o funcionamento dos coletores de evidências da extensão (`CookieCollector`, `NetworkCollector` e `ContentScriptCollector`), bem como as heurísticas utilizadas para classificação.

## 1. Coletor de Cookies (`CookieCollector`)

Monitora a criação, alteração e remoção de cookies no navegador utilizando a API `chrome.cookies.onChanged`.

* **Comportamento:** Captura metadados do cookie (nome, domínio, caminho, expiração, SameSite, Secure, HttpOnly).
* **Limitação Conhecida:** Cookies removidos são mantidos no estado em memória `session.cookies` como histórico da sessão para auditoria temporal.

## 2. Coletor de Rede (`NetworkCollector`)

Utiliza `chrome.webRequest` para auditar requisições efetuadas durante a navegação.

* **Classificação de Domínio (Primeira vs. Terceira Parte):**
  A identificação se um domínio é de terceiros (*third-party*) utiliza verificação por inclusão (`includes()`) no `hostname`.
  
  > **Nota/Limitação:** Domínios subjacentes que contenham a string do site principal no nome podem ser tratados incorretamente como *first-party*.

## 3. Coletor do Content Script e Botões de Consentimento

O Content Script inspeciona o DOM das páginas para identificar banners de privacidade e interações do usuário.

* **Classificação de Ações em Botões (`classifyButtonAction`):**
  Identifica intenção do usuário baseando-se em correspondência de palavras-chave no texto do botão.
  
* **Regra de Precedência:**
  1. A verificação de **Rejeição** (ex: *"rejeitar"*, *"refuse"*, *"decline"*) é executada **antes** da verificação de Aceitação.
  2. A verificação de **Aceitação** (ex: *"aceitar"*, *"accept"*, *"agree"*) é avaliada em seguida.
