import Database, { type Database as DatabaseInterface } from "better-sqlite3";
import type { OpenAI } from "openai";

export type HistoryMessage = {
  role: "user" | "assistant";
  content: string | null;
};

export class HistoryRepository {
  private readonly db: DatabaseInterface;

  constructor(
    private readonly sessionId: string,
    public databasePath: string,
  ) {
    this.db = new Database(databasePath);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  public addMessage(message: HistoryMessage): void {
    const stmt = this.db.prepare(`
      INSERT INTO chat_messages
        (session_id, role, content)
      VALUES
        (?, ?, ?)
    `);

    stmt.run(this.sessionId, message.role, message.content);
  }

  public getMessages(): OpenAI.Chat.Completions.ChatCompletionMessage[] {
    const stmt = this.db.prepare(`
      SELECT role, content
      FROM chat_messages
      WHERE session_id = ?
      ORDER BY id ASC
    `);

    return stmt.all(
      this.sessionId,
    ) as OpenAI.Chat.Completions.ChatCompletionMessage[];
  }
}
