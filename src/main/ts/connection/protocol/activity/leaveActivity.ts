import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {IncomingProtocolResponseMessage} from "../protocol";

export interface ActivityLeaveRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
}

export const ActivityLeaveRequestSerializer: MessageBodySerializer = (request: ActivityLeaveRequest) => {
  return {
    i: request.activityId
  };
};

export interface ActivityLeaveResponse extends IncomingProtocolResponseMessage {
}
