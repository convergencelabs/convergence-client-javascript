import {ProtocolMessage} from "./protocol";
import {OutgoingProtocolMessage} from "./protocol";
import {IncomingProtocolMessage} from "./protocol";
import {MessageBodyDeserializer} from "./MessageSerializer";
import {MessageBodySerializer} from "./MessageSerializer";

export interface ErrorMessage extends ProtocolMessage, OutgoingProtocolMessage, IncomingProtocolMessage {
  code: string;
  details: string;
}

export const ErrorMessageSerializer: MessageBodySerializer = (message: ErrorMessage) => {
  return {
    c: message.code,
    d: message.details
  };
};

export const ErrorMessageDeserializer: MessageBodyDeserializer<ErrorMessage> = (body: any) => {
  return {
    code: body.c,
    details: body.d
  };
};
