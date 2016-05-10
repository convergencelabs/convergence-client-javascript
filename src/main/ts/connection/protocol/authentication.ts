import {OutgoingProtocolRequestMessage} from "./protocol";
import {IncomingProtocolResponseMessage} from "./protocol";
import {MessageBodySerializer} from "./MessageSerializer";
import {MessageBodyDeserializer} from "./MessageSerializer";

export interface AuthRequest extends OutgoingProtocolRequestMessage {
}

export interface PasswordAuthRequest extends AuthRequest {
  username: string;
  password: string;
}

export var PasswordAuthRequestSerializer: MessageBodySerializer = (request: PasswordAuthRequest) => {
  return {
    u: request.username,
    p: request.password
  };
};

export interface TokenAuthRequest extends AuthRequest {
  token: string;
}

export var TokenAuthRequestSerializer: MessageBodySerializer = (request: TokenAuthRequest) => {
  return {
    k: request.token
  };
};

export interface AuthenticationResponse extends IncomingProtocolResponseMessage {
  success: boolean;
  userId: string;
  username: string;
}

export var AuthenticationResponseDeserializer: MessageBodyDeserializer<AuthenticationResponse> = (body: any) => {
  return {
    success: body.s,
    username: body.u,
    userId: body.i
  };
};
