import MessageType from "./MessageType";
import {OutgoingProtocolRequestMessage} from "./protocol";
import {IncomingProtocolResponseMessage} from "./protocol";

export interface AuthRequest extends OutgoingProtocolRequestMessage {
}

export interface PasswordAuthRequest extends AuthRequest {
  username: string;
  password: string;
}

export class PasswordAuthRequestSerializer {
  static serialize(request: PasswordAuthRequest): any {
    return {
      t: MessageType.PASSWORD_AUTH_REQUEST,
      u: request.username,
      p: request.password
    };
  }
}

export interface TokenAuthRequest extends AuthRequest {
  token: string;
}

export class TokenAuthRequestSerializer {
  static serialize(request: TokenAuthRequest): any {
    return {
      t: MessageType.TOKEN_AUTH_REQUEST,
      k: request.token
    };
  }
}

export interface AuthenticationResponseMessage extends IncomingProtocolResponseMessage {
  success: boolean;
  username: string;
}

export class AuthenticationResponseDeserializer {
  static deserialize(body: any): AuthenticationResponseMessage {
    return {
      success: body.s,
      username: body.u,
      type: body.t
    };
  }
}

