import { OllamaEmbeddings } from "@langchain/ollama";
import { QdrantLibArgs, QdrantVectorStore } from "@langchain/qdrant";
import { MagicNumber } from "../interfaces/magicNumber.enum";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { Document as LangChainDocument } from "@langchain/core/documents";

type DataRetriever = VectorStoreRetriever<QdrantVectorStore>;

export class QdrantRepository {
  private readonly dbConfig: QdrantLibArgs;
  constructor(
    private readonly url: string,
    private readonly apiKey: string,
    private readonly collectionName: string,
    private readonly embeddingModel: OllamaEmbeddings,
  ) {
    this.dbConfig = {
      collectionName: this.collectionName,
      apiKey: this.apiKey,
      url: this.url,
    };
  }

  public async getRetriever(): Promise<DataRetriever> {
    const vectorDB = await QdrantVectorStore.fromExistingCollection(
      this.embeddingModel,
      this.dbConfig,
    );

    const retriever = vectorDB.asRetriever({
      k: MagicNumber.FIVE,
    });

    return retriever;
  }

  public async insertDocument(
    allDocuments: LangChainDocument<Record<string, any>>[],
  ): Promise<QdrantVectorStore> {
    const vectorStore = await QdrantVectorStore.fromDocuments(
      allDocuments,
      this.embeddingModel,
      this.dbConfig,
    );

    return vectorStore;
  }
}
