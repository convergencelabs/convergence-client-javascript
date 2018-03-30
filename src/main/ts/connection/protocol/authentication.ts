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

export const PasswordAuthRequestSerializer: MessageBodySerializer = (request: PasswordAuthRequest) => {
  return {
    u: request.username,
    p: request.password
  };
};

export interface TokenAuthRequest extends AuthRequest {
  token: string;
}

export const TokenAuthRequestSerializer: MessageBodySerializer = (request: TokenAuthRequest) => {
  return {
    k: request.token
  };
};

export interface ReconnectAuthRequest extends AuthRequest {
  token: string;
}

export const ReconnectAuthRequestSerializer: MessageBodySerializer = (request: ReconnectAuthRequest) => {
  return {
    k: request.token
  };
};

export interface AnonymousAuthRequest extends AuthRequest {
  displayName?: string;
}

export const AnonymousAuthRequestSerializer: MessageBodySerializer = (request: AnonymousAuthRequest) => {
  return {
    d: request.displayName
  };
};

export interface AuthenticationResponse extends IncomingProtocolResponseMessage {
  success: boolean;
  username: string;
  sessionId: string;
  state: {[key: string]: any};
}

export const AuthenticationResponseDeserializer: MessageBodyDeserializer<AuthenticationResponse> = (body: any) => {
  return {
    success: body.s,
    username: body.n,
    sessionId: body.e,
    state: body.p
  };
};

export interface ReconnectTokenResponse extends IncomingProtocolResponseMessage {
  token: string;
}

export const ReconnectTokenResponseDeserializer: MessageBodyDeserializer<ReconnectTokenResponse> = (body: any) => {
  return {
    token: body.k
  };
};

export interface InitialUserPresence {
  sessions: string[];
  state: {[key: string]: any};
}
