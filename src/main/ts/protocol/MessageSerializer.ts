import {IncomingProtocolMessage} from "./protocol";
import MessageType from "./MessageType";
import {ErrorMessageDeserializer} from "./ErrorMessage";
import {HandshakeResponseDeserializer} from "./handhsake";
import {AuthenticationResponseDeserializer} from "./authentication";
import {OutgoingProtocolMessage} from "./protocol";
import {ErrorMessageSerializer} from "./ErrorMessage";
import {HandshakeRequestSerializer} from "./handhsake";
import {AuthRequestSerializer} from "./authentication";
import {ErrorMessage} from "./ErrorMessage";
import {HandshakeRequest} from "./handhsake";
import {AuthRequest} from "./authentication";

export class MessageSerializer {

  static deserialize(body: any, type: string): IncomingProtocolMessage {
    switch (type) {
      case MessageType.ERROR:
        return ErrorMessageDeserializer.deserialize(body);
      case MessageType.HANDSHAKE:
        return HandshakeResponseDeserializer.deserialize(body);
      case MessageType.AUTHENTICATE:
        return AuthenticationResponseDeserializer.deserialize(body);
      default:
        throw new Error("Unexpected protocol type: " + type);
    }
  }

  static serialize(body: OutgoingProtocolMessage): any {
    var type: string = body.type;
    switch (type) {
      case MessageType.ERROR:
        return ErrorMessageSerializer.serialize(<ErrorMessage>body);
      case MessageType.HANDSHAKE:
        return HandshakeRequestSerializer.serialize(<HandshakeRequest>body);
      case MessageType.AUTHENTICATE:
        return AuthRequestSerializer.serialize(<AuthRequest>body);
      default:
        throw new Error("Unexpected protocol type: " + type);
    }
  }
}

