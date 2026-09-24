import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";
import { Document as LangChainDocument } from "@langchain/core/documents";

export class PDFUtil {
  public static async load(filePath: string): Promise<LangChainDocument[]> {
    const buffer = await readFile(filePath);

    const parser = new PDFParse({
      data: buffer,
    });

    const result = await parser.getText();

    await parser.destroy();

    return result.pages.map(
      (page, index) =>
        new LangChainDocument({
          pageContent: page.text,
          metadata: {
            source: filePath,
            page: index,
          },
        }),
    );
  }
}
