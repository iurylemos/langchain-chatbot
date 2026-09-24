import type { OpenAI } from "openai";
import { Document as LangChainDocument } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MagicNumber } from "../interfaces/magicNumber.enum";
import { TRANSCRIPTION_PROMPT } from "./prompt.retriever";
import { PDFUtil } from "../utils/pdf.util";
import { QdrantRepository } from "../repositories/qdrant.repository";
import { FileUtil } from "../utils/file.util";

export class GeneralRetriever {
  private readonly textSplitter: RecursiveCharacterTextSplitter;

  constructor(
    private readonly client: OpenAI,
    private readonly documentPath: string,
    private readonly qdrantRepository: QdrantRepository,
  ) {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      separators: [""],
      chunkSize: MagicNumber.ONE_HUNDRED,
      chunkOverlap: MagicNumber.TWO_THOUSAND,
    });
  }

  public async loadText(): Promise<LangChainDocument[]> {
    return PDFUtil.load(this.documentPath);
  }

  public async identifierImage(): Promise<number[]> {
    const pagesWithImage: number[] = [];

    const allDocuments = await this.loadText();

    for (const [index, currentDocument] of allDocuments.entries()) {
      if (!currentDocument) {
        continue;
      }

      const pageText = currentDocument.pageContent;

      const currentIndex = index;

      if (/Figura \d+/.test(pageText)) {
        if (!pagesWithImage.includes(currentIndex)) {
          pagesWithImage.push(currentIndex);

          console.log(`** Página ${currentIndex} contém uma imagem!`);
        }
      }
    }

    return pagesWithImage;
  }

  public async generateTranscriptionImage(
    currentIndexDocument: number,
  ): Promise<LangChainDocument> {
    const pdfDocuments = await PDFUtil.load(this.documentPath);

    console.log("currentIndexDocument", currentIndexDocument);
    console.log("pdfDocuments", pdfDocuments);

    if (!pdfDocuments) {
      throw new Error(`Página ${currentIndexDocument} não encontrada.`);
    }

    /*
     * Aqui precisamos obter a imagem da página.
     *
     * PDFLoader fornece o texto da página, mas não o
     * pixmap/imagem da página como o PyMuPDF (fitz) faz no Python.
     *
     * A implementação abaixo espera que você forneça a imagem
     * da página em base64.
     */
    const imageBase64 = await FileUtil.convertPageToImage(
      currentIndexDocument,
      this.documentPath,
    );

    const response = await this.client.chat.completions.create({
      model: "gemma3:4b",
      temperature: MagicNumber.ZERO_THREE,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: TRANSCRIPTION_PROMPT,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    const content = response.choices[MagicNumber.ZERO]?.message.content;

    if (!content) {
      throw new Error("Não foi possível gerar a transcrição da imagem.");
    }

    return new LangChainDocument({
      pageContent: content,
      metadata: {
        source: this.documentPath,
        page: currentIndexDocument,
      },
    });
  }

  public async createChunks(
    allDocuments: LangChainDocument[],
  ): Promise<LangChainDocument[]> {
    return await this.textSplitter.splitDocuments(allDocuments);
  }

  public async indexInfo(desireInsertImage: boolean): Promise<void> {
    const imageDocuments: LangChainDocument[] = [];

    if (desireInsertImage) {
      const pagesWithImages = await this.identifierImage();

      for (const currentIndexDocument of pagesWithImages) {
        const imageDocument =
          await this.generateTranscriptionImage(currentIndexDocument);

        imageDocuments.push(imageDocument);
      }
    }

    const documentReader = await this.loadText();

    const chunks = await this.createChunks(documentReader);

    const allDocuments = [...imageDocuments, ...chunks];

    await this.qdrantRepository.insertDocument(allDocuments);

    console.log(">> Indexação realizada");
  }
}
