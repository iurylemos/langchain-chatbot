const OCCURRENCE_GUIDE_PROMPT = `
Você é responsável por cadastrar as informações do usuário em um banco quando o usuário
desejar registrar uma ocorrência de Dengue. Para realizar o cadastro, você precisa conhecer o nome e idade do
usuário caso desconheça, solicite. Não invente! Use as informações do histórico se te ajudar.

Responda com essa estrutura:

Nome: nome do usuário
Idade: idade do usuário
Valido: true somente se você tiver o nome e a idade do usuário. Caso contrário, false.

Mensagem Usuário: {input}

Histórico da conversa:
{history}
`;

const FINALIZATION_PROMPT = `
Você precisa informar ao usuário que está registrando uma ocorrência de Dengue se você conseguiu realizar o cadastro ou
precisa de mais alguma informação. Use a resposta/observação que você recebeu do sistema para orientá-lo.

Resposta do sistema de cadastro:
{action}
`;

export enum OcurrencePrompt {
  GUIDE = OCCURRENCE_GUIDE_PROMPT,
  FINALIZATION = FINALIZATION_PROMPT,
}
