import OpenAI from "openai";
import dotenv from "dotenv";
import { GeneralRetriever } from "../retrievers/general.retriever";
import { OllamaEmbeddings } from "@langchain/ollama";
import { QdrantRepository } from "../repositories/qdrant.repository";

dotenv.config();

(async (): Promise<void> => {
  try {
    const pathPDFInfo = "./src/assets/DENGUE.pdf";

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

    if (!qdrantURL || !qdrantApiKey || !client || !embeddingModel) {
      throw new Error("É obrigatório o uso dos parâmetros");
    }

    const qdrantRepository = new QdrantRepository(
      qdrantURL,
      qdrantApiKey,
      collectionQdrant,
      embeddingModel,
    );

    const generalRetriever = new GeneralRetriever(
      client,
      pathPDFInfo,
      qdrantRepository,
    );

    await generalRetriever.indexInfo(true);
  } catch (err: unknown) {
    const error = err as Error;
    console.error(">>", error);
  }
})();
