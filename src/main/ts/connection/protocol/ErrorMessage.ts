import {ProtocolMessage} from "./protocol";
import {OutgoingProtocolMessage} from "./protocol";
import {IncomingProtocolMessage} from "./protocol";
import {MessageBodyDeserializer} from "./MessageSerializer";
import {MessageBodySerializer} from "./MessageSerializer";

export interface ErrorMessage extends ProtocolMessage, OutgoingProtocolMessage, IncomingProtocolMessage {
  code: string;
  details: string;
}

export var ErrorMessageSerializer: MessageBodySerializer = (message: ErrorMessage) => {
  return {
    c: message.code,
    d: message.details
  };
};

export var ErrorMessageDeserializer: MessageBodyDeserializer = (body: any) => {
  return {
    code: body.c,
    details: body.d
  };
};
