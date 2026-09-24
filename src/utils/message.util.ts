import type {
  BaseMessage,
  MessageStructure,
  MessageToolSet,
  MessageType,
} from "@langchain/core/messages";
import type { ChatCompletionMessageParam } from "openai/resources";

export class MessageUtil {
  public static convertMessages(
    messages: BaseMessage<MessageStructure<MessageToolSet>, MessageType>[],
  ): ChatCompletionMessageParam[] {
    const messagesCompletion: ChatCompletionMessageParam[] = messages.map(
      (message): ChatCompletionMessageParam => {
        const content =
          typeof message.content === "string"
            ? message.content
            : message.content
                .map((item) => ("text" in item ? item.text : ""))
                .join("");

        if (message.type === "human") {
          return {
            role: "user",
            content,
          };
        }

        if (message.type === "system") {
          return {
            role: "system",
            content,
          };
        }

        return {
          role: "assistant",
          content,
        };
      },
    );

    return messagesCompletion;
  }
}
