import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";

export interface SubscribePresence extends OutgoingProtocolRequestMessage {
  usernames: string[];
}

export var SubscribePresenceSerializer: MessageBodySerializer = (request: SubscribePresence) => {
  return {
    u: request.usernames
  };
};
