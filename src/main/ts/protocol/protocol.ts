export interface ProtocolMessage {
  type: string;
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
  constructor(public opCode: string,
              public reqId?: number,
              public type?: string,
              public body?: any) {
  }
}
