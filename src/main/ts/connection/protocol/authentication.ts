import {OutgoingProtocolRequestMessage, IncomingProtocolResponseMessage} from "./protocol";
import {MessageBodySerializer, MessageBodyDeserializer} from "./MessageSerializer";

/**
 * @hidden
 * @internal
 */
export interface AuthRequest extends OutgoingProtocolRequestMessage {
}

/**
 * @hidden
 * @internal
 */
export interface PasswordAuthRequest extends AuthRequest {
  username: string;
  password: string;
}

/**
 * @hidden
 * @internal
 */
export const PasswordAuthRequestSerializer: MessageBodySerializer = (request: PasswordAuthRequest) => {
  return {
    u: request.username,
    p: request.password
  };
};

/**
 * @hidden
 * @internal
 */
export interface TokenAuthRequest extends AuthRequest {
  token: string;
}

/**
 * @hidden
 * @internal
 */
export const TokenAuthRequestSerializer: MessageBodySerializer = (request: TokenAuthRequest) => {
  return {
    k: request.token
  };
};

/**
 * @hidden
 * @internal
 */
export interface ReconnectAuthRequest extends AuthRequest {
  token: string;
}

/**
 * @hidden
 * @internal
 */
export const ReconnectAuthRequestSerializer: MessageBodySerializer = (request: ReconnectAuthRequest) => {
  return {
    k: request.token
  };
};

/**
 * @hidden
 * @internal
 */
export interface AnonymousAuthRequest extends AuthRequest {
  displayName?: string;
}

/**
 * @hidden
 * @internal
 */
export const AnonymousAuthRequestSerializer: MessageBodySerializer = (request: AnonymousAuthRequest) => {
  return {
    d: request.displayName
  };
};

/**
 * @hidden
 * @internal
 */
export interface AuthenticationResponse extends IncomingProtocolResponseMessage {
  success: boolean;
  username: string;
  sessionId: string;
  reconnectToken: string;
  state: {[key: string]: any};
}

/**
 * @hidden
 * @internal
 */
export const AuthenticationResponseDeserializer: MessageBodyDeserializer<AuthenticationResponse> = (body: any) => {
  return {
    success: body.s,
    username: body.n,
    sessionId: body.e,
    reconnectToken: body.k,
    state: body.p
  };
};

/**
 * @hidden
 * @internal
 */
export interface InitialUserPresence {
  sessions: string[];
  state: {[key: string]: any};
}
