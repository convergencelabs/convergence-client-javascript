export class SessionIdParser {
  static serialize(sk: SessionKey): string {
    return `${sk.username}:${sk.sessionId}`;
  }

  static parseUsername(sk: string): string {
    var parts: string[] = sk.split(":");
    return parts[0];
  }

  static deserialize(sk: string): SessionKey {
    var parts: string[] = sk.split(":");
    return {
      username: parts[0],
      sessionId: parts[1]
    };
  }
}

export interface SessionKey {
  username: string;
  sessionId: string;
}
