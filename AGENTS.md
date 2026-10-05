# GliCare Mobile — Instruções para Codex

## Projeto

GliCare é uma aplicação mobile para acompanhamento da rotina de pessoas
com diabetes.

O aplicativo permite registrar e acompanhar glicemia, aplicações de
insulina, lembretes e informações do perfil do usuário, além de apresentar
dashboard e relatórios.

## Stack

- React Native
- Expo
- TypeScript
- Expo Router
- Axios

Sempre respeite as versões já instaladas no projeto.
Não atualize dependências sem necessidade.

## Arquitetura

O projeto utiliza organização por features inspirada em Feature-Sliced Design.

Estrutura principal:

src/
├── app/
├── features/
└── shared/

### app

`src/app` contém apenas rotas e layouts do Expo Router.

Evite colocar regras de negócio ou interfaces complexas diretamente nas rotas.

Uma rota deve preferencialmente importar a tela da feature correspondente.

Exemplo:

import { ProfileScreen } from '@/features/profile';

export default ProfileScreen;

### features

Cada funcionalidade deve ficar isolada em `src/features`.

Exemplos:

src/features/
├── auth/
├── home/
├── glucose/
├── insulin/
├── profile/
├── reminders/
├── reports/
└── dashboard/

Uma feature pode conter:

components/
screens/
services/
types/
hooks/
index.ts

Crie apenas as pastas necessárias para a funcionalidade.

### shared

Código reutilizável entre features deve ficar em `src/shared`.

Exemplos:

shared/
├── api/
├── components/
└── theme/

Não duplique componentes que já existem em shared.

## Navegação

O projeto utiliza Expo Router.

Os grupos principais são:

(auth)
(main)

Rotas de autenticação pertencem a `(auth)`.

Rotas do aplicativo autenticado pertencem a `(main)`.

A navegação principal possui:

- Início
- Glicemia
- Insulina
- Dashboard
- Relatórios
- Perfil

Lembretes pertence ao fluxo principal, mas não deve aparecer como aba.

Não substitua Expo Router por React Navigation configurado manualmente.

## API

O cliente HTTP compartilhado fica em:

src/shared/api

A URL da API é configurada por:

EXPO_PUBLIC_API_URL

Não escreva URLs da API diretamente nas features.

Não coloque secrets no código.

## Estado atual

Algumas telas utilizam dados mockados ou estado local enquanto o backend
ainda está sendo desenvolvido.

Não trate dados mockados como integração concluída.

Quando integrar uma feature com a API, preserve a interface existente sempre
que possível.

## Funcionalidades do MVP

O MVP possui:

1. Autenticação
   - cadastro
   - login
   - recuperação de senha
   - sessão do usuário

2. Home
   - resumo da rotina
   - última glicemia
   - última aplicação de insulina
   - próximo lembrete

3. Glicemia
   - registrar medição
   - consultar registros

4. Insulina
   - registrar aplicação
   - consultar registros

5. Lembretes
   - criar
   - editar
   - excluir
   - ativar/desativar

6. Perfil
   - informações pessoais
   - informações sobre diabetes
   - contato de emergência

7. Dashboard
   - indicadores de glicemia
   - visualizações e gráficos

8. Relatórios
   - histórico de registros
   - filtros
   - geração/compartilhamento de relatório

## Backend

O backend é um projeto separado desenvolvido com NestJS.

O mobile não deve reproduzir regras que pertencem exclusivamente ao backend.

A integração deve acontecer através do cliente HTTP compartilhado.

## Git

O fluxo principal utiliza:

feature/* -> dev

Antes de implementar uma nova funcionalidade, verifique a branch atual.

Não faça commit, push, merge, rebase ou abra PR sem solicitação explícita.

Não altere código de outras features sem necessidade.

Antes de grandes alterações, informe quais arquivos pretende modificar.

## Implementação

Antes de criar algo novo:

1. inspecione a implementação existente;
2. procure componentes reutilizáveis;
3. respeite os padrões já utilizados;
4. faça a menor alteração necessária;
5. não faça refatorações não solicitadas.

Não reescreva arquivos inteiros quando uma alteração pequena for suficiente.

Mantenha TypeScript tipado e evite `any`.

## Validação

Após alterações relevantes, verifique:

- erros TypeScript;
- imports;
- rotas;
- lint, quando disponível;
- funcionamento da feature afetada.

Não afirme que algo funciona se não tiver sido testado.

## Comunicação

Ao finalizar uma tarefa, informe de forma sucinta:

- arquivos criados;
- arquivos modificados;
- o que foi implementado;
- validações/testes executados;
- pendências encontradas.

Se houver ambiguidade que possa alterar arquitetura, contrato com API ou
comportamento importante do produto, pergunte antes de implementar.