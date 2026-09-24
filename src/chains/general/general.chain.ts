import type { OpenAI } from "openai";
import { GeneralPrompt } from "./general.prompt";
import { MagicNumber } from "../../interfaces/magicNumber.enum";
import type { Chain } from "../../interfaces/chain.interface";

export class GeneralChain implements Chain {
  constructor(private readonly client: OpenAI) {}

  public async execute(
    input: string,
    history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [],
  ): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: GeneralPrompt.GUIDE,
      },
      ...history,
      {
        role: "user",
        content: `Dúvida do usuário: ${input}`,
      },
    ];

    const completion = await this.client.chat.completions.create({
      model: "llama3.2:3b",
      temperature: MagicNumber.ZERO_TWO,
      messages,
    });

    const firstChoice = completion.choices[MagicNumber.ZERO];

    if (!firstChoice) {
      throw new Error("A resposta da classificação não contém escolhas.");
    }

    return firstChoice.message;
  }
}
