# Módulo de Criptografia e Hash

Este módulo é responsável por garantir a imutabilidade e a determinística na geração de hashes da cadeia de evidências da extensão.

## Funções Principais

### `canonicalStringify(data: unknown): string`
Garante que um objeto JSON seja convertido em string com chaves ordenadas de forma determinística. Isso impede que variações na ordem dos atributos alterem o hash resultante.

* **Parâmetros:** `data` - Objeto, array ou valor primitivo a ser serializado.
* **Retorno:** `string` - Representação JSON canônica.

### `calculateEventHash(eventPayload: object, previousHash: string): Promise<string>`
Calcula o hash SHA-256 de um evento individual encadeado ao evento anterior.

* **Fórmula de Cálculo:**
  $$\text{Hash}(E) = \text{SHA-256}(\text{canonicalStringify}(E) + ":" + \text{previousHash})$$
* **Parâmetros:**
  * `eventPayload`: Objeto contendo os dados do evento.
  * `previousHash`: Hash SHA-256 do evento imediatamente anterior na cadeia.
* **Retorno:** `Promise<string>` - Hash SHA-256 formatado em hexadecimal.

### `verifyEvidenceChain(chain: Event[]): Promise<boolean>`
Percorre a lista de eventos armazenados e recalcula recursivamente o hash de cada item para validar a integridade da cadeia.

* **Retorno:** `true` se todos os hashes forem válidos e sequenciais; `false` se houver adulteração ou quebra de elo.
