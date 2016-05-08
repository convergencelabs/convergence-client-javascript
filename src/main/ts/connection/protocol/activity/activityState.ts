import {IncomingProtocolNormalMessage} from "../protocol";
import {OutgoingProtocolNormalMessage} from "../protocol";


export interface ActivitySetState extends OutgoingProtocolNormalMessage {
  key: string;
  value: any;
}

export interface ActivityClearState extends OutgoingProtocolNormalMessage {
  key: string;
}

export interface ActivityRemoteStateSet extends IncomingProtocolNormalMessage {
  userId: string;
  sessionId: string;
  key: string;
  value: any;
}

export interface ActivityRemoteStateCleared extends IncomingProtocolNormalMessage {
  userId: string;
  sessionId: string;
  key: string;
}
