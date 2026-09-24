import type { OpenAI } from "openai";

export interface Chain {
  execute(
    input: string,
    history: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  ): Promise<OpenAI.Chat.Completions.ChatCompletionMessage>;
}
