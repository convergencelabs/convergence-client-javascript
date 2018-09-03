import {MessageType} from "./MessageType";

/**
 * @hidden
 * @internal
 */
export interface ProtocolMessage {
  type?: MessageType;
}

/**
 * @hidden
 * @internal
 */
export interface OutgoingProtocolMessage extends ProtocolMessage {
}

/**
 * @hidden
 * @internal
 */
export interface OutgoingProtocolNormalMessage extends OutgoingProtocolMessage {
}

/**
 * @hidden
 * @internal
 */
export interface OutgoingProtocolRequestMessage extends OutgoingProtocolMessage {
}

/**
 * @hidden
 * @internal
 */
export interface OutgoingProtocolResponseMessage extends OutgoingProtocolMessage {
}

/**
 * @hidden
 * @internal
 */
export interface IncomingProtocolMessage extends ProtocolMessage {
}

/**
 * @hidden
 * @internal
 */
export interface IncomingProtocolNormalMessage extends IncomingProtocolMessage {
}

/**
 * @hidden
 * @internal
 */
export interface IncomingProtocolRequestMessage extends IncomingProtocolMessage {
}

/**
 * @hidden
 * @internal
 */
export interface IncomingProtocolResponseMessage extends IncomingProtocolMessage {
}

/**
 * @hidden
 * @internal
 */
export class MessageEnvelope {
  constructor(public body: ProtocolMessage, public requestId?: number, public responseId?: number) {
    Object.freeze(this);
  }
}
