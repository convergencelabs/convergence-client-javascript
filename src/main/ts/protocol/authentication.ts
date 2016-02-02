module convergence.protocol {

  export interface AuthRequest extends OutgoingProtocolRequestMessage {
    method: string;
  }

  export class AuthRequestSerializer {
    static serialize(request: AuthRequest): any {
      if (request.method === "password") {
        return PasswordAuthRequestSerializer.serialize(<PasswordAuthRequest>request);
      } else if (request.method == "token") {
        return TokenAuthRequestSerializer.serialize(<TokenAuthRequest>request);
      } else {
        throw new Error("invalid auth method");
      }
    }
  }

  export interface PasswordAuthRequest extends AuthRequest {
    username: string;
    password: string;
  }

  export class PasswordAuthRequestSerializer {
    static serialize(request: PasswordAuthRequest): any {
      return {
        method: "password",
        username: request.username,
        password: request.password
      };
    }
  }

  export interface TokenAuthRequest extends AuthRequest {
    token: string;
  }

  export class TokenAuthRequestSerializer {
    static serialize(request: TokenAuthRequest): any {
      return {
        method: "token",
        token: request.token
      };
    }
  }

  export interface AuthenticationResponseMessage extends IncomingProtocolResponseMessage {
    success: boolean,
    username: string
  }

  export class AuthenticationResponseDeserializer {
    static deserialize(body: any): AuthenticationResponseMessage {
      return {
        success: body.success,
        username: body.username,
        type: MessageType.HANDSHAKE
      };
    }
  }
}
