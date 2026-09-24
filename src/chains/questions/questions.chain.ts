import type { OpenAI } from "openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableLambda, RunnableParallel } from "@langchain/core/runnables";
import { MagicNumber } from "../../interfaces/magicNumber.enum";
import { QuestionsPrompt } from "./questions.prompt";
import type { ChatPromptValueInterface } from "@langchain/core/prompt_values";
import type { Chain } from "../../interfaces/chain.interface";
import type { InputQuestion } from "../../interfaces/input.interface";
import { MessageUtil } from "../../utils/message.util";
import { Document as LangChainDocument } from "@langchain/core/documents";
import { QdrantRepository } from "../../repositories/qdrant.repository";

export class QuestionChain implements Chain {
  constructor(
    private readonly client: OpenAI,
    private readonly qdrantRepository: QdrantRepository,
  ) {}

  public async execute(
    input: string,
    history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [],
  ): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> {
    const retrieverDB = await this.qdrantRepository.getRetriever();

    const uniqueText = new RunnableLambda({
      func: async (allDocuments: LangChainDocument[]): Promise<string> => {
        console.log(
          ">> Recuperador executado! Veja os documentos retornados:",
          allDocuments,
        );

        for (const currentDocument of allDocuments) {
          console.log("--------------------- chunk --------------------");
          console.log(currentDocument.pageContent);
          console.log("------------------------------------------------");
        }

        return allDocuments
          .map((currentDocument) => currentDocument.pageContent)
          .join("\n\n");
      },
    });

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", QuestionsPrompt.GUIDE],
      new MessagesPlaceholder("history"),
      ["human", "Pergunta do Usuário: {questionUser}"],
    ]);

    const chain = RunnableParallel.from({
      questionUser: new RunnableLambda({
        func: (data: InputQuestion) => data.questionUser,
      }),
      history: new RunnableLambda({
        func: (data: {
          history: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
        }) => data.history,
      }),
      context: new RunnableLambda({
        func: (data: InputQuestion) => data.questionUser,
      })
        .pipe(retrieverDB)
        .pipe(uniqueText),
    }).pipe(promptTemplate);

    const response = await chain
      .pipe(
        async (
          promptValue: ChatPromptValueInterface,
        ): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> => {
          const messages = promptValue.toChatMessages();

          const messagesCompletion = MessageUtil.convertMessages(messages);

          const completion = await this.client.chat.completions.create({
            model: "llama3.2:3b",
            temperature: MagicNumber.ZERO_TWO,
            messages: messagesCompletion,
          });

          const firstChoice = completion.choices[MagicNumber.ZERO];

          if (!firstChoice) {
            throw new Error("A resposta do modelo não contém escolhas.");
          }

          return firstChoice.message;
        },
      )
      .invoke({
        questionUser: input,
        history,
      });

    return response;
  }
}
