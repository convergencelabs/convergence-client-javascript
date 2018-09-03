import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {IncomingProtocolResponseMessage} from "../protocol";

/**
 * @hidden
 * @internal
 */
export interface ActivityCloseRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
}

/**
 * @hidden
 * @internal
 */
export const ActivityCloseRequestSerializer: MessageBodySerializer = (request: ActivityCloseRequest) => {
  return {
    i: request.activityId
  };
};

/**
 * @hidden
 * @internal
 */
export interface ActivityCloseResponse extends IncomingProtocolResponseMessage {
}
