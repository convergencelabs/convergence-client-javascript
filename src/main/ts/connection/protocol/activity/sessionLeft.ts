import {IncomingProtocolNormalMessage} from "../protocol";

export interface ActivitySessionLeft extends IncomingProtocolNormalMessage {
  userId: string;
  sessionId: string;
}
