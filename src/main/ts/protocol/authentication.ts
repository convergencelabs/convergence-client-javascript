module convergence.message {

  export interface AuthRequest extends OutgoingProtocolRequestMessage {
  }

  export interface PasswordAuthRequest extends AuthRequest {
    username: string;
    password: string;
  }

  export class PasswordAuthRequestSerializer {
    static serialize(request: PasswordAuthRequest): any {
      return {
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
