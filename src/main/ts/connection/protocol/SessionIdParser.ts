export class SessionIdParser {
  static serialize(sk: SessionKey): string {
    return `${sk.userId}:${sk.sessionId}`;
  }

  static parseUserId(sk: string): string {
    var parts: string[] = sk.split(":");
    return parts[0];
  }

  static deserialize(sk: string): SessionKey {
    var parts: string[] = sk.split(":");
    return {
      userId: parts[0],
      sessionId: parts[1]
    };
  }
}

export interface SessionKey {
  userId: string;
  sessionId: string;
}
