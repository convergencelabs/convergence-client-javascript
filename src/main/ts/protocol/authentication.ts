import MessageType from "./MessageType";
import {OutgoingProtocolRequestMessage} from "./protocol";
import {IncomingProtocolResponseMessage} from "./protocol";
import {MessageSerializer} from "./MessageSerializer";

export interface AuthRequest extends OutgoingProtocolRequestMessage {
}

export interface PasswordAuthRequest extends AuthRequest {
  username: string;
  password: string;
}

MessageSerializer.registerMessageBodySerializer(MessageType.PASSWORD_AUTH_REQUEST, (request: PasswordAuthRequest) => {
  return {
    u: request.username,
    p: request.password
  };
});


export interface TokenAuthRequest extends AuthRequest {
  token: string;
}

MessageSerializer.registerMessageBodySerializer(MessageType.TOKEN_AUTH_REQUEST, (request: TokenAuthRequest) => {
    return {
      k: request.token
    };
  });

export interface AuthenticationResponseMessage extends IncomingProtocolResponseMessage {
  success: boolean;
  username: string;
}

export class AuthenticationResponseDeserializer {
  static deserialize(body: any): AuthenticationResponseMessage {
    return {
      type: MessageType.AUTHENTICATE_RESPONSE,
      success: body.s,
      username: body.u

    };
  }
}

