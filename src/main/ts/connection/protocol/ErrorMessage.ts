import {ProtocolMessage, OutgoingProtocolMessage, IncomingProtocolMessage} from "./protocol";
import {MessageBodyDeserializer, MessageBodySerializer} from "./MessageSerializer";

/**
 * @hidden
 * @internal
 */
export interface ErrorMessage extends ProtocolMessage, OutgoingProtocolMessage, IncomingProtocolMessage {
  code: string;
  message: string;
  details: {[key: string]: any};
}

/**
 * @hidden
 * @internal
 */
export const ErrorMessageSerializer: MessageBodySerializer = (message: ErrorMessage) => {
  return {
    c: message.code,
    m: message.message,
    d: message.details,
  };
};

/**
 * @hidden
 * @internal
 */
export const ErrorMessageDeserializer: MessageBodyDeserializer<ErrorMessage> = (body: any) => {
  return {
    code: body.c,
    message: body.m,
    details: body.d
  };
};
