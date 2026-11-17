# Roteiro de teste em aparelho

Roteiro para vocês testarem o GliCare em celulares Android e iOS. Ele cobre o que não funciona ou se comporta diferente no navegador.

## 1. Preparação

**O que fazer:**
1. Subam a API (`minha-rotina-diabetica`, NestJS) no computador.
2. Na pasta do app, rodem `npm ci`, copiem `.env.example` para `.env` e ajustem `EXPO_PUBLIC_API_URL`:
   - Celular físico na mesma rede Wi-Fi: `http://<IP do computador na rede>:3000/api`
   - Emulador Android: `http://10.0.2.2:3000/api`
3. Reiniciem o Expo com `npm start` (ou usem uma build de desenvolvimento instalada no aparelho para testar os alertas locais dos casos 7 e 8).
4. Não usem conta pronta: cada uma cria a própria conta de teste no caso 2.

**Resultado esperado:** O app abre na tela de login (`GliCare` / **Entrar** / **Criar Conta**) e conversa com a API configurada.
- [ ] Android
- [ ] iOS

## 2. Cadastro com o aceite dos Termos

**O que fazer:**
1. Na tela de login, toquem em **Criar Conta**.
2. Preencham **Nome completo**, **E-mail**, **Senha** (8 a 72 caracteres, com letras e números) e **Confirmar senha**. Deixem desmarcada a caixa **Li e aceito os Termos de Uso e a Política de Privacidade** e toquem em **Criar Conta**.
3. Toquem no link **Termos de Uso**, rolem o texto e toquem em **Voltar**. Façam o mesmo em **Política de Privacidade** e toquem em **Voltar**.
4. Marquem a caixa de aceite e toquem em **Criar Conta**.
5. No login, preencham **E-mail** e **Senha** e toquem em **Entrar**.
6. No cartão **Complete seu perfil**, toquem em **Completar perfil**, preencham **Data de nascimento**, **Altura (metros)** e **Peso (kg)**, escolham o **Tipo de diabetes** (**Tipo 1**, **Tipo 2** ou **Outro**) e toquem em **Salvar alterações**.

**Resultado esperado:** Sem marcar a caixa, aparece `Aceite os Termos de Uso e a Política de Privacidade para criar a conta.`. Os dois documentos abrem e voltam ao cadastro sem perder o que foi digitado. Ao criar a conta, abre o alerta **Conta criada** (`Entre com seu e-mail e sua senha. Depois, complete seus dados de saúde no Perfil.`). Ao salvar a segunda etapa no Perfil, abre o alerta **Perfil atualizado** (`Suas alterações foram salvas.`) e o aviso de perfil incompleto some.
- [ ] Android
- [ ] iOS

## 3. Sessão

**O que fazer:**
1. Com a conta logada, fechem o app por completo nos aplicativos recentes do sistema e abram de novo.
2. Abram a aba **Perfil** e toquem em **Sair da Conta**.
3. Na tela de login, preencham **E-mail** e **Senha** e toquem em **Entrar**.

**Resultado esperado:** Ao fechar e reabrir, vocês continuam logadas na aba **Início**. Ao tocar em **Sair da Conta**, o app volta para o login. Ao entrar de novo, a aba **Início** carrega o resumo da conta.
- [ ] Android
- [ ] iOS

## 4. Área segura

**O que fazer:**
1. Em um aparelho com recorte na tela (notch) ou ilha dinâmica, abram cada aba: **Início**, **Glicemia**, **Insulina**, **Dashboard**, **Relatórios** e **Perfil**.
2. Abram também **Lembretes** (ícone de sino no topo) e, em **Perfil**, abram **Notificações**, **Termos de Uso** e **Política de Privacidade**.
3. Tentem girar o aparelho para a horizontal (`"orientation": "portrait"` no `app.json`).

**Resultado esperado:** Nenhum título ou botão do topo fica escondido debaixo da barra de status ou do recorte, e a barra de abas não fica colada sob a barra de gestos inferior. O app permanece na vertical (retrato).
- [ ] Android
- [ ] iOS

## 5. Glicemia

**O que fazer:**
1. Na aba **Glicemia**, digitem um **Valor (mg/dL)** normal (ex.: `100`), escolham um **Momento da Medição** (ex.: **Jejum**) e toquem em **Salvar Registro**. Repitam com um valor alto (ex.: `220`).
2. Com a data e a hora atuais, digitem um valor abaixo de 54 (ex.: `50`) e toquem em **Salvar Registro**. Depois, toquem em **Entendi** no cartão de aviso e abram a aba **Início**.
3. Voltem à aba **Glicemia**, toquem em **Hora** (ou **Data**), escolham um horário com mais de 1 hora no passado, digitem um valor abaixo de 54 (ex.: `48`) e toquem em **Salvar Registro**.

**Resultado esperado:**
- Nos valores normal e alto: alerta **Registro salvo** (`Sua glicemia foi registrada com sucesso.`) e registros listados em **Histórico de glicemia** como `Normal` e `Alta`.
- No valor abaixo de 54 recente: alerta com título **Atenção: glicemia muito baixa** e texto `Glicemia abaixo de 54 mg/dL. Isso é uma hipoglicemia que precisa de atenção agora. Siga o plano para hipoglicemia combinado com sua equipe de saúde e meça de novo. Se houver confusão, desmaio ou convulsão, ligue 192 (SAMU).`. O mesmo texto aparece no cartão vermelho da tela. Na aba **Início**, o cartão **Última Glicemia** mostra `Baixa` e `Abaixo de 54 mg/dL: siga o plano para hipoglicemia e meça de novo.`.
- No valor abaixo de 54 antigo (mais de 1 hora): alerta **Registro salvo** e cartão na tela com o texto neutro `Este registro ficou abaixo de 54 mg/dL (hipoglicemia). Converse com sua equipe de saúde sobre esse episódio.`. Se for a última leitura da conta, o cartão da **Início** mostra `Abaixo de 54 mg/dL (hipoglicemia).`.
- [ ] Android
- [ ] iOS

## 6. Insulina

**O que fazer:**
1. Abram a aba **Insulina** e confiram as seis opções em **Tipo de Insulina**:
   - `Ultrarrápida (lispro, asparte, glulisina, Fiasp)`
   - `Rápida (regular)`
   - `Intermediária (NPH, detemir)`
   - `Longa (glargina U100)`
   - `Ultralonga (degludeca, glargina U300)`
   - `Pré-misturada (70/30, Mix)`
2. Selecionem uma categoria, informem **Dose (UI)** (ex.: `10`), escolham o **Local da Aplicação** (**Abdômen**, **Braço**, **Coxa** ou **Glúteo**) e toquem em **Registrar Aplicação**.

**Resultado esperado:** Abre o alerta **Aplicação registrada** (`Os dados da aplicação foram salvos com sucesso.`), e o registro aparece em **Histórico de aplicações** com a dose, o rótulo da categoria e o local.
- [ ] Android
- [ ] iOS

## 7. Lembretes e alertas

**O que fazer:**
1. No topo de **Início** ou **Perfil**, toquem no ícone de sino para abrir **Lembretes**.
2. Toquem em **Ativar alertas neste aparelho** e neguem a permissão no pedido do sistema (rótulo do sistema: conferir na tela).
3. Autorizem as notificações do app nos ajustes do aparelho, voltem ao app e toquem em **Ativar alertas neste aparelho** (ou **Sincronizar alertas**).
4. Toquem em **Adicionar lembrete**, preencham **Título** (ex.: `Medir glicemia`), mantenham a **Data** de hoje, coloquem **Horário** para daqui a 2 minutos e toquem em **Adicionar**. Minimizem o app ou bloqueiem o aparelho e esperem.
5. Toquem na notificação quando ela chegar.
6. Criem outro lembrete para daqui a 2 minutos e desliguem a chave ao lado dele no cartão. Aguardem o horário.
7. Religuem a chave, toquem em **Editar**, mudem o **Horário** para daqui a 3 minutos e toquem em **Salvar**. Em seguida, toquem em **Excluir** no cartão e em **Confirmar exclusão**.

**Resultado esperado:**
- Ao negar permissão: aparece `Permissão não concedida. Autorize notificações nos ajustes do aparelho.`.
- Ao autorizar e ativar: o botão muda para **Desativar alertas neste aparelho** e mostra a quantidade de alertas programados.
- No horário do lembrete ativo: chega notificação com título `GliCare` e texto `Você tem um lembrete. Abra o aplicativo para consultar.` (sem mostrar o título cadastrado). Tocar nela abre **Lembretes**.
- Com a chave desligada ou após **Confirmar exclusão**, nenhum alerta toca no horário antigo.
- [ ] Android
- [ ] iOS

## 8. Alertas depois de sair da conta e depois de excluir a conta

**O que fazer:**
1. Com alertas ativados, criem um lembrete para daqui a 2 minutos. Abram **Perfil**, toquem em **Sair da Conta** e aguardem os 2 minutos na tela de login.
2. Entrem em uma conta de teste que possa ser apagada, ativem **Ativar alertas neste aparelho**, criem um lembrete para daqui a 2 minutos, vão em **Perfil** > **Excluir minha conta** > **Excluir conta** e aguardem os 2 minutos.

**Resultado esperado:** Nenhum alerta antigo toca depois de sair da conta nem depois de excluir a conta.
- [ ] Android
- [ ] iOS

## 9. Relatório em PDF

**O que fazer:**
1. Abram a aba **Relatórios**, escolham um filtro (`7 dias`, `30 dias`, `90 dias` ou preencham **Data inicial** e **Data final** e toquem em **Aplicar período**).
2. Toquem em **Gerar e compartilhar PDF** e fechem/cancelem a janela de compartilhamento do sistema.
3. Toquem de novo em **Gerar e compartilhar PDF**, enviem por e-mail ou aplicativo de mensagens (conferir na tela) e abram o PDF recebido.

**Resultado esperado:** Cancelar o compartilhamento não trava a tela nem mostra erro. Quando compartilhado, o PDF abre com o cabeçalho `GliCare | Relatório de registros`, o nome da conta, o período, o **Resumo do período** e a tabela **Glicemias e aplicações de insulina**.
- [ ] Android
- [ ] iOS

## 10. Tema escuro

**O que fazer:**
1. Na aba **Perfil**, liguem a chave **Tema escuro**.
2. Confiram a barra de status do aparelho, todas as abas (**Início**, **Glicemia**, **Insulina**, **Dashboard**, **Relatórios**, **Perfil**), um campo de texto com o teclado aberto e um alerta do sistema (ex.: ao salvar uma glicemia).
3. Fechem o app por completo e abram novamente.
4. Saiam da conta em **Sair da Conta** para conferir o logo nas telas de login e **Cadastro**.

**Resultado esperado:** O fundo e os cartões ficam escuros com textos legíveis, a barra de status usa ícones claros, o logo exibe o desenho branco preenchido e o teclado não cobre o campo em edição. Ao fechar e reabrir o app, o **Tema escuro** continua ligado. (O alerta do sistema e o teclado seguem o tema do aparelho: conferir na tela).
- [ ] Android
- [ ] iOS

## 11. Excluir conta

**O que fazer:**
1. Na aba **Perfil**, rolem até o fim e toquem em **Excluir minha conta**.
2. No modal **Excluir sua conta?**, toquem em **Cancelar**.
3. Toquem novamente em **Excluir minha conta** e depois em **Excluir conta**.
4. Na tela de login, tentem entrar com o e-mail e a senha da conta excluída tocando em **Entrar**.

**Resultado esperado:** **Cancelar** fecha o modal sem apagar nada. **Excluir conta** encerra a sessão e leva para a tela de login. Ao tentar entrar de novo com a mesma conta, o login falha e exibe a mensagem de erro retornada pela API (conferir na tela).
- [ ] Android
- [ ] iOS

## 12. Sem internet

**O que fazer:**
1. Com a conta logada, abram a aba **Glicemia**.
2. Ativem o modo avião do celular (Wi-Fi e dados móveis desligados).
3. Digitem um **Valor (mg/dL)** (ex.: `110`), toquem em **Salvar Registro** e depois desativem o modo avião.

**Resultado esperado:** O app não fecha nem congela e mostra a mensagem `Não foi possível conectar à API. Verifique sua conexão e tente novamente.`.
- [ ] Android
- [ ] iOS

## Como registrar um problema

Se algum caso falhar, abram uma issue no GitHub ou avisem o grupo, informando:
- **Aparelho:** marca e modelo (ex.: Samsung Galaxy A34, iPhone 13).
- **Versão do sistema:** versão do Android ou do iOS.
- **Número do caso:** qual item deste roteiro estava sendo testado (1 a 12).
- **O que apareceu:** passos feitos e mensagem ou comportamento observado.
- **Print da tela:** imagem mostrando o erro ou o desalinhamento.
