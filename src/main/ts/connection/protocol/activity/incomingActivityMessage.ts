import {IncomingProtocolMessage} from "../protocol";

export interface IncomingActivityMessage extends IncomingProtocolMessage {
  activityId: string;
}
