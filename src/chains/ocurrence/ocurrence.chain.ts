import type { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ParsedChatCompletionMessage } from "openai/resources/chat/completions.js";
import { MagicNumber } from "../../interfaces/magicNumber.enum";
import { OcurrencePrompt } from "./ocurrence.prompt";
import {
  type OccurrenceInput,
  occurrenceInputSchema,
} from "./ocurrence.schema";
import { FileUtil } from "../../utils/file.util";
import type { Chain } from "../../interfaces/chain.interface";

export class OcurrenceChain implements Chain {
  constructor(private readonly client: OpenAI) {}

  public async execute(
    input: string,
    history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [],
  ): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> {
    const occurrence = await this.registerOccurrence(input, history);

    const actionExecuted = await FileUtil.registerOcurrence(occurrence);

    return this.finalize(input, history, actionExecuted);
  }

  private async registerOccurrence(
    input: string,
    history: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  ): Promise<ParsedChatCompletionMessage<OccurrenceInput>> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: OcurrencePrompt.GUIDE,
      },
      ...history,
      {
        role: "user",
        content: `Mensagem Usuário: ${input}`,
      },
    ];

    const completion = await this.client.chat.completions.parse({
      model: "gpt-4o-mini",
      temperature: MagicNumber.ZERO,
      messages,
      response_format: zodResponseFormat(
        occurrenceInputSchema,
        "registerOccurrence",
      ),
    });

    const firstChoice = completion.choices[MagicNumber.ZERO];

    if (!firstChoice) {
      throw new Error(
        "A resposta do cadastro de ocorrência não contém escolhas.",
      );
    }

    return firstChoice.message;
  }

  private async finalize(
    input: string,
    history: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    actionExecuted: string,
  ): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: OcurrencePrompt.FINALIZATION,
      },
      ...history,
      {
        role: "user",
        content: `Pergunta do Usuário: ${input}

Resposta do sistema de cadastro:
${actionExecuted}`,
      },
    ];

    const completion = await this.client.chat.completions.create({
      model: "llama3.2:3b",
      temperature: MagicNumber.ZERO_TWO,
      messages,
    });

    const firstChoice = completion.choices[MagicNumber.ZERO];

    if (!firstChoice) {
      throw new Error("A resposta da finalização não contém escolhas.");
    }

    return firstChoice.message;
  }
}
