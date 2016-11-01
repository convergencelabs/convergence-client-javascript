export class SessionIdParser {
  static serialize(sk: SessionKey): string {
    return `${sk.username}:${sk.sessionId}`;
  }

  static parseUsername(sk: string): string {
    return SessionIdParser.deserialize(sk).username;
  }

  static deserialize(sk: string): SessionKey {
    const index: number = sk.lastIndexOf(":");

    return {
      username: sk.substring(0, index),
      sessionId: sk.substring(index + 1, sk.length)
    };
  }
}

export interface SessionKey {
  username: string;
  sessionId: string;
}
