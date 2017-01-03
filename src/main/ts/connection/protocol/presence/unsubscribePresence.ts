import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";

export interface UnsubscribePresence extends OutgoingProtocolRequestMessage {
  username: string;
}

export const UnsubscribePresenceSerializer: MessageBodySerializer = (request: UnsubscribePresence) => {
  return {
    u: request.username
  };
};
