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
