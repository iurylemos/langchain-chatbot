import type { OpenAI } from "openai";

export interface UserQuestion {
  userQuestion: string;
}

export interface UserQuestionHistory {
  userQuestion: string;
  history: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
}
