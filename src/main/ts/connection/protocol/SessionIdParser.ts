/**
 * @hidden
 * @internal
 */
export class SessionIdParser {
  public static serialize(sk: SessionKey): string {
    return `${sk.username}:${sk.sessionId}`;
  }

  public static parseUsername(sk: string): string {
    return SessionIdParser.deserialize(sk).username;
  }

  public static deserialize(sk: string): SessionKey {
    const index: number = sk.lastIndexOf(":");

    return {
      username: sk.substring(0, index),
      sessionId: sk.substring(index + 1, sk.length)
    };
  }
}

/**
 * @hidden
 * @internal
 */
export interface SessionKey {
  username: string;
  sessionId: string;
}
