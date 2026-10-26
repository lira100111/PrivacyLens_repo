# Comunicação Inter-Processos (IPC Messages)

Especificação das mensagens trocadas entre o `Content Script`, o `Service Worker` (Background) e o `Sidepanel`.

## Tabela de Mensagens

| Identificador Mensagem | Origem | Destino | Descrição |
| :--- | :--- | :--- | :--- |
| `GET_SESSION` | Sidepanel | Service Worker | Retorna o estado da sessão de auditoria atual. |
| `STOP_AUDIT` | Sidepanel | Service Worker | Solicita a finalização do registro e gravação da evidência de encerramento. |
| `VERIFY_CHAIN_INTEGRITY` | Sidepanel | Service Worker | Executa a verificação completa dos hashes da cadeia armazenada. |
| `CHAIN_VERIFICATION_RESULT` | Service Worker | Sidepanel | Emite o resultado booleano e os detalhes da validação da cadeia. |

## Estrutura dos Payloads

### `STOP_AUDIT`
* **Payload:** `{ action: "STOP_AUDIT" }`
* **Resposta Esperada:**
```json
{
  "status": "COMPLETED",
  "stoppedAt": 1700000000000
}

### `VERIFY_CHAIN_INTEGRITY`
* **Payload:**  `{ action: "VERIFY_CHAIN_INTEGRITY" }

**Resposta Esperada:**

```JSON
{
  "isValid": true,
  "totalEvents": 42,
  "lastHash": "a3f8c1..."
}

---

#### 3. Roteiro de Testes: `lens-extension/docs/testing.md`

```markdown
# Guia de Testes e Validação

Este documento descreve as estratégias de teste automatizado e o roteiro para testes manuais no navegador.

## 1. Testes Automatizados (Proposta Vitest)

A suíte de testes unitários e de integração deve cobrir as funções de hashing e o gerenciador de cadeia.

* **Execução dos testes:**
```bash
npm run test
