import MessageType from "./MessageType";
import {ProtocolMessage} from "./protocol";
import {OutgoingProtocolMessage} from "./protocol";
import {IncomingProtocolMessage} from "./protocol";

export interface ErrorMessage extends ProtocolMessage, OutgoingProtocolMessage, IncomingProtocolMessage {
  code: string;
  details: string;
}

export class ErrorMessageDeserializer {
  static deserialize(body: any): ErrorMessage {
    return {
      code: body.c,
      details: body.d,
      type: MessageType.ERROR
    };
  }
}

export class ErrorMessageSerializer {
  static serialize(message: ErrorMessage): any {
    return {
      c: message.code,
      d: message.details
    };
  }
}
