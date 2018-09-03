import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {IncomingProtocolResponseMessage} from "../protocol";

/**
 * @hidden
 * @internal
 */
export interface ActivityLeaveRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
}

/**
 * @hidden
 * @internal
 */
export const ActivityLeaveRequestSerializer: MessageBodySerializer = (request: ActivityLeaveRequest) => {
  return {
    i: request.activityId
  };
};

/**
 * @hidden
 * @internal
 */
export interface ActivityLeaveResponse extends IncomingProtocolResponseMessage {
}
