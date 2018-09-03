import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";

/**
 * @hidden
 * @internal
 */
export interface UnsubscribePresence extends OutgoingProtocolRequestMessage {
  username: string;
}

/**
 * @hidden
 * @internal
 */
export const UnsubscribePresenceSerializer: MessageBodySerializer = (request: UnsubscribePresence) => {
  return {
    u: request.username
  };
};
