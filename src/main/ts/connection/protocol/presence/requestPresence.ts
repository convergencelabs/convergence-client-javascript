import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {UserPresence} from "../../../presence/UserPresence";
import {UserPresenceDeserializer} from "./userPresence";

export interface RequestPresence extends OutgoingProtocolRequestMessage {
  usernames: string[];
}

export var RequestPresenceSerializer: MessageBodySerializer = (request: RequestPresence) => {
  return {
    u: request.usernames
  };
};

export interface RequestPresenceResponse extends IncomingProtocolNormalMessage {
  userPresences: UserPresence[]
}

export var RequestPresenceResponseDeserializer: MessageBodyDeserializer<RequestPresenceResponse> = (body: any) => {
  var userPresences: UserPresence[] = [];
  for (var userPresence of body.p) {
    userPresences.push(UserPresenceDeserializer(userPresence))
  }
  var result: RequestPresenceResponse = {
    userPresences: userPresences
  };
  return result;
};
