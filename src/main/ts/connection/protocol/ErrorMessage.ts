import {ProtocolMessage} from "./protocol";
import {OutgoingProtocolMessage} from "./protocol";
import {IncomingProtocolMessage} from "./protocol";
import {MessageBodyDeserializer} from "./MessageSerializer";
import {MessageBodySerializer} from "./MessageSerializer";

export interface ErrorMessage extends ProtocolMessage, OutgoingProtocolMessage, IncomingProtocolMessage {
  code: string;
  message: string;
  details: {[key: string]: any};
}

export const ErrorMessageSerializer: MessageBodySerializer = (message: ErrorMessage) => {
  return {
    c: message.code,
    m: message.message,
    d: message.details,
  };
};

export const ErrorMessageDeserializer: MessageBodyDeserializer<ErrorMessage> = (body: any) => {
  return {
    code: body.c,
    message: body.m,
    details: body.d
  };
};
