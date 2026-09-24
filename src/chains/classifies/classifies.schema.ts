import {
  object as zodObject,
  number as zodNumber,
  type infer as zodInfer,
} from "zod";

export const classifiesInputSchema = zodObject({
  option: zodNumber()
    .int()
    .describe(
      "Defina 1 se a pergunta do usuário solicitar informações ou orientações sobre Dengue ou gráfico da dengue. " +
        "Defina 2 se for saudações ou temas que não são referentes à Dengue. " +
        "Defina 3 se for uma solicitação de cadastro de ocorrência de Dengue ou se a pessoa está registrando que está com Dengue.",
    ),
});

export type ClassifiesInput = zodInfer<typeof classifiesInputSchema>;
