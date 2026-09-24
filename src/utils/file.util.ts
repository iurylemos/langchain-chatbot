import { appendFile, access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import type { ParsedChatCompletionMessage } from "openai/resources/chat/completions.js";
import type { OccurrenceInput } from "../chains/ocurrence/ocurrence.schema";
import { MagicNumber } from "../interfaces/magicNumber.enum";

export class FileUtil {
  public static async registerOcurrence(
    occurrence: ParsedChatCompletionMessage<OccurrenceInput>,
  ): Promise<string> {
    const data = occurrence.parsed;

    if (!data) {
      throw new Error(
        "Não foi possível obter os dados estruturados da ocorrência.",
      );
    }

    if (!data.isValid) {
      return `Para que seja possível o cadastro da ocorrência, preciso do seu nome e idade! Poderia me passar por favor? O que tenho até agora > nome: ${data.name} | Idade ${data.year}`;
    }

    const filePath = "../../assets/cadastro_dengue.csv";

    let fileExists = true;

    try {
      await access(filePath, constants.F_OK);
    } catch {
      fileExists = false;
    }

    if (!fileExists) {
      await appendFile(filePath, "nome,idade\n", "utf-8");
    }

    await appendFile(filePath, `${data.name},${data.year}\n`, "utf-8");

    return "Cadastro da ocorrência realizada com sucesso.";
  }

  public static async convertPageToImage(
    numberPage: number,
    documentPath: string,
  ): Promise<string> {
    const { default: muPdf } = await import("mupdf");

    const pdfBuffer = await readFile(documentPath);

    const pdfDocument = muPdf.Document.openDocument(
      pdfBuffer,
      "application/pdf",
    );

    const totalPages = pdfDocument.countPages();

    if (numberPage < MagicNumber.ZERO || numberPage >= totalPages) {
      throw new Error(`Página ${numberPage} não encontrada.`);
    }

    const page = pdfDocument.loadPage(numberPage);

    const matrix = muPdf.Matrix.scale(MagicNumber.TWO, MagicNumber.TWO);

    const pixMap = page.toPixmap(matrix, muPdf.ColorSpace.DeviceRGB, false);

    const pngBuffer = pixMap.asPNG();

    return Buffer.from(pngBuffer).toString("base64");
  }
}
