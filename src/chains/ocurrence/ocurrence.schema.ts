import {
  object as zodObject,
  string as zodString,
  type infer as zodInfer,
  boolean as zodBoolean,
} from "zod";

export const occurrenceInputSchema = zodObject({
  name: zodString().describe("Nome do usuário, se não tiver deixe vazio ('')"),
  year: zodString().describe("Idade do usuário, se não tiver deixe vazio ('')"),
  isValid: zodBoolean().describe(
    "Somente responda com true se você tiver o nome e a idade do usuário, caso contrário false.",
  ),
});

export type OccurrenceInput = zodInfer<typeof occurrenceInputSchema>;
