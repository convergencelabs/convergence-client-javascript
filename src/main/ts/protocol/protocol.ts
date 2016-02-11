import MessageType from "./MessageType";

export interface ProtocolMessage {
  type: MessageType;
}
export interface OutgoingProtocolMessage extends ProtocolMessage {
}
export interface OutgoingProtocolNormalMessage extends OutgoingProtocolMessage {
}
export interface OutgoingProtocolRequestMessage extends OutgoingProtocolMessage {
}
export interface OutgoingProtocolResponseMessage extends OutgoingProtocolMessage {
}
export interface IncomingProtocolMessage extends ProtocolMessage {
}
export interface IncomingProtocolNormalMessage extends IncomingProtocolMessage {
}
export interface IncomingProtocolRequestMessage extends IncomingProtocolMessage {
}
export interface IncomingProtocolResponseMessage extends IncomingProtocolMessage {
}

export class MessageEnvelope {
  constructor(public body: ProtocolMessage, public requestId?: number, public responseId?: number) {
  }
}
