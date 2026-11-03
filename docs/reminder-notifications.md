# Alertas locais dos lembretes

Os lembretes continuam na API `/reminders`. O Android/iOS agenda alertas únicos neste aparelho depois de uma consulta autenticada. Não há push remoto, token de push nem alteração no backend.

Na tela Lembretes, **Ativar alertas neste aparelho** solicita permissão ao sistema e guarda no SecureStore a conta que ativou o recurso. A preferência pertence ao aparelho e à conta; outra conta precisa ativar seus próprios alertas. **Desativar alertas** limpa a preferência e os alertas locais, mantendo os registros na API. O navegador informa que o recurso está disponível no aplicativo Android/iOS.

## Sincronização

- Seleciona até os 60 próximos lembretes ativos e futuros, ordenados por instante. Não cria recorrência.
- Criar, editar, ativar, desativar ou excluir com confirmação da API solicita nova sincronização. A listagem isolada não produz um ciclo de consultas.
- Identificadores estáveis evitam duplicação; alteração de horário cancela o anterior. O título não entra na notificação: o texto é genérico, sem dados clínicos.
- Entrar na conta e retornar ao aplicativo revalidam a sessão e sincronizam. Os botões de sincronização e atualização da lista permitem nova tentativa.
- Sair da conta cancela os agendamentos e descarta notificações apresentadas pelo recurso. A saída aguarda a limpeza; uma falha permite tentar sair novamente. A preferência pode ser reutilizada pela mesma conta em novo login.
- A sessão existente já é suspensa durante sua revalidação. Nesse intervalo os alertas são cancelados e só são restaurados depois de validar a sessão e consultar a API. Sem rede durante essa revalidação, os alertas permanecem suspensos até nova tentativa bem-sucedida.
- Falha de sincronização aparece separadamente do resultado do salvamento. Uma falha de rede com resultado incerto na mutação exige atualizar a lista antes de reenviar.
- Tocar no alerta abre Lembretes depois da autenticação, sem transportar informações clínicas na navegação.

## Limites

O horário segue o instante ISO salvo na API. Uma mudança de fuso altera a hora local exibida, sem transformar o evento em um horário recorrente. O sistema operacional controla entrega, som, economia de bateria e permissões. O aplicativo não exige permissão especial de alarme exato; o código Android desta versão do Expo usa agendamento inexato quando o sistema não permite alarmes exatos. O alerta pode atrasar.

Os eventos além dos 60 próximos só entram na janela após nova sincronização; não existe reposição em tarefa de fundo. Mudanças feitas em outro aparelho só são percebidas ao sincronizar. Não é um sistema de alertas clínicos garantidos.

Dependência instalada: `expo-notifications` 57.0.24, dentro da faixa compatível `~57.0.20` declarada pelo Expo do projeto. A instalação também ajustou dependências exigidas pelo módulo. O plugin foi adicionado ao `app.json`; gere uma nova build de desenvolvimento para validar a configuração nativa.

## Verificações automatizadas

`npm.cmd run test:notifications` executa 20 testes do coordenador com API, relógio, permissão e agendador simulados. Há também dois testes de confirmação/invalidação no serviço de lembretes. As demais suítes mobile foram verificadas. Esses testes não acionam notificações reais nem substituem testes em aparelhos.

## Roteiro manual pendente

1. Configurar `EXPO_PUBLIC_API_URL`, iniciar o backend e instalar uma build de desenvolvimento atualizada em Android/iOS.
2. Entrar com conta de teste, abrir Lembretes e verificar que não há pedido automático de permissão. Ativar, negar e depois permitir nos ajustes; sincronizar.
3. Criar evento alguns minutos no futuro. Confirmar o texto genérico em primeiro plano, segundo plano e aparelho bloqueado. Tocar e verificar abertura de Lembretes.
4. Editar o horário, desativar e excluir; verificar que o alerta antigo não dispara. Ativar novamente e atualizar repetidamente sem duplicação.
5. Sair antes do disparo, trocar de conta e verificar cancelamento e isolamento da preferência. Voltar à mesma conta e verificar sincronização.
6. Revogar permissão, bloquear o canal Android e simular falha de rede. Verificar mensagens, tentativas manuais e suspensão na revalidação da sessão.
7. Testar datas passadas, fuso, reinício do aparelho, economia de bateria e mais de 60 eventos. Confirmar o limite e a necessidade de sincronizar para repor a janela.
8. Na web, verificar que o CRUD continua funcionando e que não é solicitada permissão de notificações.

Referência oficial: [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/). O comportamento Android de fallback foi conferido em `node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/delegates/ExpoSchedulingDelegate.kt` da versão instalada.
