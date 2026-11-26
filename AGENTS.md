# Convenções do frontend

## Regras críticas

- Rota nova tem `meta`
- Se precisar criar stores crie `src/stores/` com Pinia
- Use `gap-xs|sm|md|lg|xl` (`src/css/app.scss`) no lugar de `q-gutter-*`.

## Nomes

- Domínio em português (`peticao`, `clientes`), prefixos técnicos em inglês (`use*`, `get*`, `fetch*`, `on*`, `is*`, `has*`, `loading*`).
- Textos da interface em pt-BR, só com a primeira letra maiúscula.
- Enums de string com valor igual à chave e sufixo `Enum`.
- Labels de enum em `Record<XEnum, string>` ou em options `{ label, value }[]`, ao lado do enum.

## Imports

- Use os aliases `components/`, `composables/`, `stores/`, `types/`, `utils/`, `pages/` e `layouts/`, e `./` só para a mesma pasta.
- Use `import type` para importações só de tipo.

## Componentes

- Use `<script setup lang="ts">`, na ordem template → script → style.
- Antes de criar input, select ou dialog, procure em `components/`.
- Use `defineModel` para v-model.
- Use ícones Line Awesome (`las la-*`).
- Valide formulários com `useVuelidate`
- Declare funções com `function`. Arrow function só como argumento.
- Ações sobem por `emit`, não por prop de função.
- Repasse a mesma prop ou o mesmo emit por no máximo 3 níveis. Passou disso, use ou crie uma store.
- Declare um tipo próprio para cada formulário, sem reaproveitar um tipo global com tudo opcional.
- No template, use kebab-case para o que não é importado no arquivo (globais de `src/boot/inmeta-global.js`, Quasar e nativos do Vue) e PascalCase só para o que é importado.
- Abra dialogs com `$q.dialog({ component, componentProps }).onOk(...)`. Dentro deles, use `useDialogPluginComponent()` com `<i-dialog ref="dialogRef">`.
- Páginas novas usam `<q-page padding class="column gap-md container">`.

## CSS

- Prefira as classes utilitárias do Quasar a CSS próprio.
- Nomes de classe usam hífen simples, sem BEM.

## Comentários

- Comente só o porquê que não é óbvio.
