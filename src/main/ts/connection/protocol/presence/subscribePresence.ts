import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {UserPresence} from "../../../presence/UserPresence";
import {UserPresenceDeserializer} from "./userPresence";
import {IncomingProtocolResponseMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface SubscribePresenceRequest extends OutgoingProtocolRequestMessage {
  usernames: string[];
}

export var SubscribePresenceRequestSerializer: MessageBodySerializer = (request: SubscribePresenceRequest) => {
  return {
    u: request.usernames
  };
};

export interface SubscribePresenceResponse extends IncomingProtocolResponseMessage {
  userPresences: UserPresence[];
}

export var SubscribePresenceResponseDeserializer: MessageBodyDeserializer<SubscribePresenceResponse> = (body: any) => {
  var result: SubscribePresenceResponse = {
    userPresences: body.p.forEach( p => UserPresenceDeserializer(p))
  };

  return result;
};
