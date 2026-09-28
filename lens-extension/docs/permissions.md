# Matriz de Justificativa de Permissões (Manifest V3)

Em conformidade com o **Princípio do Menor Privilégio** e as políticas da Google Chrome Web Store, esta matriz documenta a necessidade técnica de cada permissão solicitada no [`manifest.config.ts`](file:///home/leo/workspace/ProjectLens/lens-extension/manifest.config.ts):

| Permissão | Tipo | Justificativa Técnica Obrigatória |
|---|---|---|
| `sidePanel` | API | Permite renderizar a interface de auditoria no painel lateral do navegador sem fechar quando o usuário clica ou interage com a página web (ao contrário de popups padrão). |
| `activeTab` | API | Permite identificar a URL e o identificador da aba aberta pelo usuário quando o mesmo clica no botão "Iniciar Auditoria". |
| `storage` | API | Permite persistir localmente os eventos coletados, as sessões de auditoria e o estado da cadeia criptográfica (`chrome.storage.local`). |
| `cookies` | API | Permite consultar cookies ativos (`chrome.cookies.getAll`) e observar criação/modificação em tempo real (`chrome.cookies.onChanged`) antes e após a escolha de consentimento. |
| `webRequest` | API | Permite inspecionar requisições para identificar domínios de terceiros e cabeçalhos de resposta HTTP relacionados à segurança (`Content-Security-Policy`, `HSTS`, `X-Content-Type-Options`). |
| `scripting` | API | Permite execução de scripts de suporte quando necessário para inspeção de armazenamento em páginas específicas. |
| `<all_urls>` | Host Permission | Necessária para que a auditoria técnica possa ser executada em qualquer website que o auditor ou usuário final deseje auditar. Nenhum dado é enviado para servidores externos. |

---

## Privacidade da Própria Ferramenta

* **Zero Telemetria Externa:** A extensão não possui servidores remotos de telemetria ou rastreamento.
* **Armazenamento 100% Local:** Todas as evidências e cookies coletados residem exclusivamente no armazenamento local do navegador do usuário (`chrome.storage.local`).
* **Controle Total do Usuário:** A coleta ocorre apenas quando a auditoria é expressamente iniciada pelo usuário através do botão "Iniciar".
