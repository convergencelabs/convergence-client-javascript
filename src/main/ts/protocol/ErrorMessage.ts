import MessageType from "./MessageType";
import {ProtocolMessage} from "./protocol";
import {OutgoingProtocolMessage} from "./protocol";
import {IncomingProtocolMessage} from "./protocol";

export interface ErrorMessage extends ProtocolMessage, OutgoingProtocolMessage, IncomingProtocolMessage {
  code: string;
  details: string;
}

export class ErrorMessageDeserializer {
  static deserialize(json: any): ErrorMessage {
    return {
      code: json.code,
      details: json.details,
      type: MessageType.ERROR
    };
  }
}

export class ErrorMessageSerializer {
  static serialize(message: ErrorMessage): any {
    return {
      code: message.code,
      details: message.details
    };
  }
}
