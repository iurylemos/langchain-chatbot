const CLASSIFIES_OPTION_PROMPT = `Defina 1 se a pergunta do usuário solicitar informações ou orientações sobre Dengue ou gráfico da dengue. \
Defina 2  se for saudações ou temas que não são referentes à Dengue.\
Defina 3 se for uma solicitação de cadastro de ocorrência de Dengue ou se a pessoa está registrando que está com Dengue.`;

const CLASSIFIES_GUIDE_PROMPT = `Você é um especialista em classificação. Você receberá perguntas do usuário e precisará classificá-las \
da melhor forma entre as opções estabelecidas.
Também preste atenção ao histórico da conversa quando você for realizar a classificação, pois durante um cadastro de \
ocorrência pode ser solicitado novas informações do usuário e a classificação pode ser com base no contexto histórico. 

\n${CLASSIFIES_OPTION_PROMPT}\n

Pergunta Usuário: {input}

## Historico da conversa:
{history}`;

export enum ClassifiesPrompt {
  OPTION = CLASSIFIES_OPTION_PROMPT,
  GUIDE = CLASSIFIES_GUIDE_PROMPT,
}
