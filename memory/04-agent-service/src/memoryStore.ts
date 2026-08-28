export type Message = { role: 'user' | 'assistant' | 'system', content: string };

export class MemoryStore {
  // In-memory store for MVP. In production, use Redis, Postgres, Mem0, or Zep.
  private sessions: Map<string, Message[]> = new Map();
  private userPreferences: Map<string, string> = new Map();

  getHistory(sessionId: string): Message[] {
    return this.sessions.get(sessionId) || [];
  }

  saveHistory(sessionId: string, messages: Message[]) {
    const existing = this.sessions.get(sessionId) || [];
    this.sessions.set(sessionId, [...existing, ...messages]);
  }

  getPreferences(userId: string): string {
    return this.userPreferences.get(userId) || "No specific preferences known.";
  }

  savePreference(userId: string, preference: string) {
    this.userPreferences.set(userId, preference);
  }
}

export const memoryStore = new MemoryStore();
