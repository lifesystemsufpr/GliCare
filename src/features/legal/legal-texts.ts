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
        'Se estes termos mudarem, avisaremos no aplicativo. Mudanças importantes podem exigir um novo aceite.',
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
        'Conta: nome, e-mail e senha. A senha é guardada de forma criptografada (hash) e ninguém da equipe tem acesso a ela.',
        'Perfil: data de nascimento, tipo de diabetes, altura e peso.',
        'Registros de saúde: glicemias (valor, momento da medição, data e hora, observações), aplicações de insulina (tipo, dose, local, data e hora, observações) e lembretes (título, data e hora, ativo ou não).',
        'Aceite: a versão destes documentos que você aceitou e a data do aceite.',
        'Segurança: para limitar tentativas de login e de recuperação de senha, guardamos por pouco tempo um código derivado do endereço IP e do e-mail, que não permite recuperar esses dados.',
        'No seu aparelho ficam a sessão de acesso e a preferência de tema (claro ou escuro). No navegador, a sessão fica só na memória e o tema fica no armazenamento local do navegador.',
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
        'Não vendemos nem compartilhamos os seus dados com outras empresas.',
        'Os dados ficam em servidores contratados para hospedar o serviço: [preencher: provedor de hospedagem e país]. O envio de e-mails de recuperação usa [preencher: provedor de e-mail].',
        'O relatório em PDF só é compartilhado se você mesmo escolher enviá-lo, e pelo meio que você escolher.',
        'Podemos fornecer dados se uma lei ou ordem judicial exigir.',
      ],
    },
    {
      title: '6. Por quanto tempo guardamos',
      paragraphs: [
        'Enquanto a sua conta existir.',
        'Quando você exclui a conta, apagamos o perfil, as glicemias, as aplicações de insulina, os lembretes e os pedidos de recuperação de senha. A conta fica apenas como um registro inativo, sem nome, e-mail ou senha válidos.',
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
        'Se esta política mudar, avisaremos no aplicativo. Mudanças importantes podem exigir um novo aceite.',
      ],
    },
  ],
};
