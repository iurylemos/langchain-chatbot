import OpenAI from "openai";
import dotenv from "dotenv";
import { MagicNumber } from "./interfaces/magicNumber.enum";
import {
  RunnableLambda,
  RunnableParallel,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import type { ParsedChatCompletionMessage } from "openai/resources/chat/completions.js";
import { ClassifiesChain } from "./chains/classifies/classifies.chain";
import { OcurrenceChain } from "./chains/ocurrence/ocurrence.chain";
import { QuestionChain } from "./chains/questions/questions.chain";
import { GeneralChain } from "./chains/general/general.chain";
import type {
  InputParallelWithHistory,
  InputRoutingChain,
  InputRoutingChainOption,
} from "./interfaces/input.interface";
import { OllamaEmbeddings } from "@langchain/ollama";
import { QdrantRepository } from "./repositories/qdrant.repository";
import { HistoryRepository } from "./repositories/history.repository";

dotenv.config();

export class ChatBotDengue {
  public static async main(input: string): Promise<void> {
    try {
      const client = new OpenAI({
        apiKey: "ollama",
        baseURL: "http://localhost:11434/v1",
      });

      const embeddingModel = new OllamaEmbeddings({
        model: "nomic-embed-text",
        baseUrl: "http://localhost:11434",
      });

      const qdrantURL = process.env.QDRANT_URL;
      const qdrantApiKey = process.env.QDRANT_API_KEY;
      const collectionQdrant = "chatbot_health";

      const sqliteDBName = "memory.db";

      const sessionId = "1";

      if (!qdrantURL || !qdrantApiKey || !client || !embeddingModel) {
        throw new Error("É obrigatório o uso dos parâmetros");
      }

      const qdrantRepository = new QdrantRepository(
        qdrantURL,
        qdrantApiKey,
        collectionQdrant,
        embeddingModel,
      );

      const classifiesChain = new ClassifiesChain(client);
      const questionsChain = new QuestionChain(client, qdrantRepository);
      const occurrenceChain = new OcurrenceChain(client);
      const generalChain = new GeneralChain(client);
      const historyRepository = new HistoryRepository(sessionId, sqliteDBName);

      const classificationRunnable = new RunnableLambda({
        func: async (
          data: InputParallelWithHistory,
        ): Promise<ParsedChatCompletionMessage<InputRoutingChainOption>> => {
          return await classifiesChain.execute(data);
        },
      });

      const parallelChain = RunnableParallel.from({
        input: (data: InputParallelWithHistory): string => data.input,
        history: (
          data: InputParallelWithHistory,
        ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => data.history,
        response: (
          data: InputParallelWithHistory,
        ): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> =>
          classificationRunnable.invoke(data),
      });

      const routingChain = new RunnableLambda({
        func: async (
          data: InputRoutingChain,
        ): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> => {
          const option = data.response.parsed
            ? data.response.parsed.option
            : MagicNumber.ZERO;

          console.log(`>> Opção escolhida: ${option}`);

          switch (option) {
            case MagicNumber.ONE:
              console.log(">> Informações sobre Dengue");

              return await questionsChain.execute(data.input, data.history);

            case MagicNumber.TWO:
              console.log(">> Assuntos gerais e saudações");

              return await generalChain.execute(data.input, data.history);

            case MagicNumber.THREE:
              console.log(">> Cadastro de ocorrência Dengue");

              return await occurrenceChain.execute(data.input, data.history);

            default:
              throw new Error(`Opção não mapeada: ${option}`);
          }
        },
      });

      const chainWithHistory = RunnablePassthrough.assign({
        history: (
          data: InputParallelWithHistory,
        ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] =>
          data.history.slice(-MagicNumber.TEN),
      }).pipe(parallelChain);

      const chainPrincipal = chainWithHistory.pipe(routingChain);

      const history = historyRepository.getMessages();

      const response = await chainPrincipal.invoke({
        input,
        history,
      });

      if (!response.content) {
        throw new Error("A resposta do modelo não possui conteúdo.");
      }

      historyRepository.addMessage({
        role: "user",
        content: input,
      });

      historyRepository.addMessage({
        role: "assistant",
        content: response.content,
      });

      console.log("\nResposta:");
      console.log(response.content);
    } catch (err: unknown) {
      const error = err as Error;

      console.error("error message:", error);
    }
  }
}

const input = "Quais são os sintomas da dengue?";

ChatBotDengue.main(input);
