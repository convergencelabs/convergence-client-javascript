import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";

export interface UnsubscribePresence extends OutgoingProtocolRequestMessage {
  userIds: string[];
}

export var UnsubscribePresenceSerializer: MessageBodySerializer = (request: UnsubscribePresence) => {
  return {
    u: request.userIds
  };
};
