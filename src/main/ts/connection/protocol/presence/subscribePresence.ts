import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {UserPresence} from "../../../presence/UserPresence";
import {UserPresenceDeserializer} from "./userPresence";
import {IncomingProtocolResponseMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface SubscribePresenceRequest extends OutgoingProtocolRequestMessage {
  username: string;
}

export var SubscribePresenceRequestSerializer: MessageBodySerializer = (request: SubscribePresenceRequest) => {
  return {
    u: request.username
  };
};

export interface SubscribePresenceResponse extends IncomingProtocolResponseMessage {
  userPresence: UserPresence;
}

export var SubscribePresenceResponseDeserializer: MessageBodyDeserializer<SubscribePresenceResponse> = (body: any) => {
  var result: SubscribePresenceResponse = {
    userPresence: UserPresenceDeserializer(body.u)
  };

  return result;
};
