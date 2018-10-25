import {IncomingProtocolResponseMessage, OutgoingProtocolRequestMessage} from "./protocol";
import {MessageBodySerializer, MessageBodyDeserializer} from "./MessageSerializer";

/**
 * @hidden
 * @internal
 */
export interface HandshakeRequest extends OutgoingProtocolRequestMessage {
  reconnect: boolean;
  reconnectToken: string;
}

/**
 * @hidden
 * @internal
 */
export const HandshakeRequestSerializer: MessageBodySerializer = (request: HandshakeRequest) => {
  return {
    r: request.reconnect,
    k: request.reconnectToken
  };
};

/**
 * @hidden
 * @internal
 */
export interface HandshakeResponse extends IncomingProtocolResponseMessage {
  success: boolean;
  reconnectToken: string;
  protocolConfig: any; // todo make interface
  error?: {code: string, details: string};
  retryOk?: boolean;
}

/**
 * @hidden
 * @internal
 */
export const HandshakeResponseDeserializer: MessageBodyDeserializer<HandshakeResponse> = (body: any) => {
  const error = body.e !== undefined ? {
    code: body.e.c,
    details: body.e.d
  } : undefined;
  return {
    success: body.s,
    reconnectToken: body.k,
    protocolConfig: body.c,
    error,
    retryOk: body.r
  };
};
