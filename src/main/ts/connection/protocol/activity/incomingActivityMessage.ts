import {IncomingProtocolMessage} from "../protocol";

/**
 * @hidden
 * @internal
 */
export interface IncomingActivityMessage extends IncomingProtocolMessage {
  activityId: string;
}
