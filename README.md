# GliCare (app)

App para pessoas com diabetes registrarem glicemia e insulina, receberem
lembretes e acompanharem a rotina em gráficos e relatórios. Feito com React
Native, Expo, TypeScript e Expo Router. A API fica em outro repositório
(`minha-rotina-diabetica`, NestJS).

## Pré-requisitos

- Node.js 22 e npm.
- A API rodando (veja o README da API).
- Para Android: Android Studio com um emulador, ou um celular com Expo Go na
  mesma rede do computador.
- Para iOS: macOS com Xcode, ou um iPhone com Expo Go.

## Como rodar

1. Instale as dependências:

   ```bash
   npm ci
   ```

2. Copie `.env.example` para `.env` e ajuste o endereço da API. Ele precisa
   terminar em `/api`:

   | Onde o app roda | `EXPO_PUBLIC_API_URL` |
   | --- | --- |
   | Navegador no mesmo computador | `http://localhost:3000/api` |
   | Emulador Android | `http://10.0.2.2:3000/api` |
   | Celular físico | `http://<IP do computador na rede>:3000/api` |

   No celular, `localhost` aponta para o próprio celular, não para o
   computador. Depois de mudar o `.env`, reinicie o Expo.

3. Inicie:

   ```bash
   npm start
   ```

   No terminal do Expo, `a` abre no Android, `i` no iOS e `w` no navegador.
   Também dá para usar `npm run android`, `npm run ios` ou `npm run web`.

## Verificações

```bash
npm run typecheck
npm run test:auth
npm run test:glucose
npm run test:insulin
npm run test:profile
npm run test:reminders
npm run test:home
npm run test:dashboard
npm run test:reports
npm run test:recovery
npm run test:notifications
```

O repositório ainda não tem CI. Rode as verificações antes de abrir o PR.

## Estrutura

- `src/app`: rotas do Expo Router. Os grupos são `(auth)`, para login,
  cadastro e recuperação de senha, e `(main)`, para as abas do app.
- `src/features`: uma pasta por funcionalidade (auth, home, glucose, insulin,
  reminders, dashboard, reports, profile), com telas, componentes e serviços.
- `src/shared`: cliente HTTP (`api`), componentes reutilizáveis, tema e
  formatação (`format.ts`).
- `scripts/*.test.mjs`: testes de cada feature, rodados com `node --test`.

As regras para quem contribui estão em `AGENTS.md`.

## Limitações conhecidas

- **Navegador:** a sessão fica só na memória, então recarregar a página pede
  login de novo. Alertas locais dos lembretes e compartilhamento nativo do PDF
  só funcionam no Android e no iOS. No navegador, o PDF abre a janela de
  impressão.
- **Recuperação de senha:** o link do e-mail usa o esquema
  `glicaremobile://reset-password`. Ele só abre o app em build nativo ou no
  Expo Go com o esquema configurado.
- **Termos de Uso e Política de Privacidade:** as telas existem e o cadastro
  pede o aceite, mas os textos são rascunho, com trechos `[preencher: ...]`
  (`src/features/legal/legal-texts.ts`). Não publique antes de a PO completar
  esses trechos e de uma revisão jurídica.
- **Teste em aparelho:** área segura, alertas dos lembretes, PDF, tema escuro
  e aviso de glicemia abaixo de 54 mg/dL precisam ser conferidos num celular.
  O roteiro está em [`docs/teste-em-aparelho.md`](docs/teste-em-aparelho.md).
