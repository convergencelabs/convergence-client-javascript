import MessageType from "./MessageType";
import {ProtocolMessage} from "./protocol";
import {OutgoingProtocolMessage} from "./protocol";
import {IncomingProtocolMessage} from "./protocol";
import {MessageSerializer} from "./MessageSerializer";

export interface ErrorMessage extends ProtocolMessage, OutgoingProtocolMessage, IncomingProtocolMessage {
  code: string;
  details: string;
}

MessageSerializer.registerMessageBodySerializer(MessageType.ERROR, (message: ErrorMessage) => {
  return {
    c: message.code,
    d: message.details
  };
});

MessageSerializer.registerMessageBodyDeserializer(MessageType.ERROR, (body: any) => {
  return {
    code: body.c,
    details: body.d
  };
});
