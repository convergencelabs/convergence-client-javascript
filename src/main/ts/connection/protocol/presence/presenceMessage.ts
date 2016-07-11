import {IncomingProtocolNormalMessage} from "../protocol";

export interface IncomingPresenceNormalMessage extends IncomingProtocolNormalMessage {
  userId: string;
}
