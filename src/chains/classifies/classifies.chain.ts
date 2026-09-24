import type { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ParsedChatCompletionMessage } from "openai/resources/chat/completions.js";
import { MagicNumber } from "../../interfaces/magicNumber.enum";
import { ClassifiesPrompt } from "./classifies.prompt";
import {
  type ClassifiesInput,
  classifiesInputSchema,
} from "./classifies.schema";
import type { InputParallelWithHistory } from "../../interfaces/input.interface";

export class ClassifiesChain {
  constructor(private readonly client: OpenAI) {}

  public async execute(
    data: InputParallelWithHistory,
  ): Promise<ParsedChatCompletionMessage<ClassifiesInput>> {
    const historyText = data.history
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n");

    const prompt = ClassifiesPrompt.GUIDE.replace(
      "{input}",
      data.input,
    ).replace("{history}", historyText);

    const completion = await this.client.chat.completions.parse({
      model: "llama3.2:3b",
      temperature: MagicNumber.ZERO,
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
      response_format: zodResponseFormat(
        classifiesInputSchema,
        "classifyUserInput",
      ),
    });

    const firstChoice = completion.choices[MagicNumber.ZERO];

    if (!firstChoice) {
      throw new Error("A resposta da classificação não contém escolhas.");
    }

    return firstChoice.message;
  }
}
