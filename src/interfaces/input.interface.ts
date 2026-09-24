import type { OpenAI } from "openai";
import type { ParsedChatCompletionMessage } from "openai/resources/chat/completions.js";
import type { ClassifiesInput } from "../chains/classifies/classifies.schema";

export interface InputParallelWithHistory extends Record<string, unknown> {
  input: string;
  history: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
}

export interface InputRoutingChain {
  input: string;
  history: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  response: ParsedChatCompletionMessage<ClassifiesInput>;
}

export interface InputRoutingChainOption {
  option: number;
}

export interface InputQuestion {
  questionUser: string;
}
