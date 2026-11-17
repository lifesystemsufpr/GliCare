// Textos dos Termos de Uso e da Política de Privacidade.
// RASCUNHO para aprovação da PO e revisão jurídica. Os trechos entre colchetes
// ("[preencher: ...]") precisam ser completados antes da publicação.
// Ao mudar o texto, mude também LEGAL_VERSION aqui e na API
// (versão aceita no cadastro).

export const LEGAL_VERSION = '2026-11-16';

export type LegalSection = { title: string; paragraphs: string[] };
export type LegalDocument = { title: string; updatedAt: string; sections: LegalSection[] };

export const termsOfUse: LegalDocument = {
  title: 'Termos de Uso',
  updatedAt: '16/11/2026',
  sections: [
    {
      title: '1. O que é o GliCare',
      paragraphs: [
        'O GliCare é um aplicativo para registrar e acompanhar a rotina de quem convive com diabetes: medições de glicemia, aplicações de insulina, lembretes, painel e relatórios.',
        'O aplicativo é oferecido por [preencher: nome do responsável pelo aplicativo, CNPJ ou instituição], doravante "nós".',
      ],
    },
    {
      title: '2. O GliCare não substitui o cuidado de saúde',
      paragraphs: [
        'O GliCare organiza as informações que você registra. Ele não faz diagnóstico, não indica tratamento e não define doses de insulina.',
        'As faixas e avisos mostrados seguem referências gerais da Sociedade Brasileira de Diabetes. A sua meta pode ser diferente: siga sempre o que foi combinado com a sua equipe de saúde.',
        'Em caso de mal-estar, sintomas de hipoglicemia que não melhoram, confusão, desmaio ou convulsão, procure atendimento imediatamente ou ligue 192 (SAMU).',
      ],
    },
    {
      title: '3. Sua conta',
      paragraphs: [
        'Para usar o GliCare, você cria uma conta com nome, e-mail e senha. Você é responsável pelas informações que registra e por manter a sua senha em sigilo.',
        'O uso é pessoal: cada conta deve registrar os dados de uma única pessoa.',
        'Menores de 18 anos só podem usar o aplicativo com o consentimento e o acompanhamento de um dos pais ou responsável legal.',
      ],
    },
    {
      title: '4. Uso adequado',
      paragraphs: [
        'Você se compromete a não tentar acessar contas de outras pessoas, não interferir no funcionamento do serviço e não usar o aplicativo para fins ilegais.',
        'Podemos suspender contas que violem estes termos, avisando pelo e-mail cadastrado sempre que possível.',
      ],
    },
    {
      title: '5. Disponibilidade',
      paragraphs: [
        'Trabalhamos para manter o GliCare funcionando, mas ele pode ficar fora do ar para manutenção ou por falhas técnicas. Os alertas de lembrete dependem das configurações e da permissão de notificações do seu aparelho.',
        'Por isso, não use o GliCare como único meio para lembrar de uma dose ou de um cuidado importante.',
      ],
    },
    {
      title: '6. Excluir a conta',
      paragraphs: [
        'Você pode excluir a sua conta a qualquer momento em Perfil > Excluir conta. Os seus registros de saúde são apagados e a conta é anonimizada, como descrito na Política de Privacidade.',
      ],
    },
    {
      title: '7. Mudanças nestes termos',
      paragraphs: [
        'Se estes termos mudarem, a versão nova fica disponível no aplicativo, com a data da atualização. Mudanças importantes podem exigir um novo aceite.',
      ],
    },
    {
      title: '8. Contato',
      paragraphs: [
        'Dúvidas sobre estes termos: [preencher: e-mail de contato].',
        'Estes termos seguem a lei brasileira. Foro: [preencher: comarca].',
      ],
    },
  ],
};

export const privacyPolicy: LegalDocument = {
  title: 'Política de Privacidade',
  updatedAt: '16/11/2026',
  sections: [
    {
      title: '1. Quem cuida dos seus dados',
      paragraphs: [
        'Controlador: [preencher: nome do responsável pelo aplicativo, CNPJ ou instituição].',
        'Encarregado de proteção de dados (DPO): [preencher: nome e e-mail].',
        'Esta política explica quais dados o GliCare trata, para quê e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018, LGPD).',
      ],
    },
    {
      title: '2. Dados que coletamos',
      paragraphs: [
        'Conta: nome, e-mail e senha. A senha é guardada apenas como hash (bcrypt), um código que não permite ler a senha original.',
        'Perfil: data de nascimento, tipo de diabetes, altura e peso.',
        'Registros de saúde: glicemias (valor, momento da medição, data e hora, observações), aplicações de insulina (tipo, dose, local, data e hora, observações) e lembretes (título, data e hora, ativo ou não).',
        'Aceite: a versão destes documentos que você aceitou e a data do aceite.',
        'Recuperação de senha: quando você pede para recuperar a senha, guardamos um código de uso único, na forma de hash, com prazo de validade.',
        'Segurança: para limitar tentativas de login e de recuperação de senha, guardamos temporariamente contadores identificados por códigos derivados do endereço IP e do e-mail. Esses códigos não permitem recuperar o IP nem o e-mail.',
        'Registros técnicos: quando acontece um erro no servidor, registramos a rota acessada e a mensagem técnica do erro, para corrigir o problema. [preencher: por quanto tempo os registros do servidor ficam guardados].',
        'Contato de emergência: versões anteriores do GliCare pediam nome, relação e telefone de um contato de emergência. Esse dado não é mais pedido nem usado. O que já tinha sido informado está numa cópia temporária, descrita no item 6.',
        'No seu aparelho ficam a sessão de acesso, a preferência de tema (claro ou escuro) e a informação de que os alertas de lembrete estão ligados. Os lembretes ativos viram alertas agendados no próprio aparelho, com um texto genérico, sem o título do lembrete. No navegador, a sessão fica só na memória e o tema fica no armazenamento local do navegador.',
        'Não usamos ferramentas de publicidade, de análise de uso ou de rastreamento.',
      ],
    },
    {
      title: '3. Para que usamos',
      paragraphs: [
        'Para criar e manter a sua conta, guardar os seus registros e mostrar o resumo, o painel, os relatórios e os lembretes.',
        'Para enviar o e-mail de recuperação de senha quando você pedir.',
        'Para proteger a sua conta contra acessos indevidos.',
      ],
    },
    {
      title: '4. Base legal',
      paragraphs: [
        'Glicemia, insulina, tipo de diabetes e os demais dados de saúde são dados pessoais sensíveis. Nós os tratamos com o seu consentimento, dado de forma específica ao aceitar esta política no cadastro (LGPD, art. 11, I).',
        'Os dados de conta e de segurança são tratados para executar o serviço que você pediu e para prevenir fraudes (LGPD, art. 7º, V e IX, e art. 11, II, "g").',
        'Você pode retirar o consentimento a qualquer momento excluindo a conta. Sem esses dados o aplicativo não consegue funcionar.',
      ],
    },
    {
      title: '5. Com quem compartilhamos',
      paragraphs: [
        'Não vendemos os seus dados e não os usamos para publicidade.',
        'Para o aplicativo funcionar, os dados passam por empresas que prestam serviço para nós (operadores). A hospedagem do servidor e do banco de dados é feita por [preencher: provedor de hospedagem e país]. O envio de e-mails é feito por [preencher: provedor de e-mail], que recebe o seu nome, o seu e-mail e o código de recuperação de senha, só quando você pede a recuperação.',
        'O relatório em PDF é gerado no seu aparelho, num arquivo temporário que o aplicativo apaga depois do compartilhamento. Ele só é compartilhado se você mesmo escolher enviá-lo, e pelo meio que você escolher. A cópia que ficar no aplicativo de destino (e-mail, mensagens ou nuvem) não é controlada pelo GliCare.',
        'Podemos fornecer dados se uma lei ou ordem judicial exigir.',
      ],
    },
    {
      title: '6. Por quanto tempo guardamos',
      paragraphs: [
        'Enquanto a sua conta existir.',
        'Quando você exclui a conta, apagamos o perfil, as glicemias, as aplicações de insulina, os lembretes, os pedidos de recuperação de senha e o registro do aceite. A conta fica apenas como um registro inativo, com um identificador interno e as datas de criação e de exclusão, sem nome, e-mail ou senha válidos.',
        'Os contadores de tentativas de login não ficam ligados à sua conta e expiram sozinhos.',
        'A cópia dos contatos de emergência informados em versões anteriores é apagada quando você exclui a conta. Ela será removida por completo depois de confirmada a versão atual do aplicativo.',
        'Cópias de segurança do banco de dados são apagadas em até [preencher: prazo] dias.',
      ],
    },
    {
      title: '7. Seus direitos',
      paragraphs: [
        'Pela LGPD (art. 18), você pode: confirmar se tratamos seus dados e acessá-los; corrigir dados incompletos ou errados; pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários; pedir a portabilidade; saber com quem compartilhamos; e retirar o consentimento.',
        'Muitos desses pedidos você faz no próprio aplicativo: editar o perfil, gerar o relatório em PDF e excluir a conta. Para os demais, escreva para [preencher: e-mail do encarregado].',
        'Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).',
      ],
    },
    {
      title: '8. Segurança',
      paragraphs: [
        'A comunicação com o servidor é criptografada [confirmar: HTTPS na produção], as senhas são guardadas com hash e o acesso aos dados exige login. Nenhum sistema é totalmente seguro: se houver um incidente que possa causar risco a você, avisaremos você e a ANPD.',
      ],
    },
    {
      title: '9. Crianças e adolescentes',
      paragraphs: [
        'Os dados de menores de 18 anos só podem ser tratados com o consentimento de um dos pais ou responsável legal, no melhor interesse da criança ou do adolescente (LGPD, art. 14).',
      ],
    },
    {
      title: '10. Mudanças nesta política',
      paragraphs: [
        'Se esta política mudar, a versão nova fica disponível no aplicativo, com a data da atualização. Mudanças importantes podem exigir um novo aceite.',
      ],
    },
  ],
};
