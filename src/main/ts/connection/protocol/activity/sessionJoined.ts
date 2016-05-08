import {IncomingProtocolNormalMessage} from "../protocol";

export interface ActivitySessionJoined extends IncomingProtocolNormalMessage {
  userId: string;
  sessionId: string;
}
