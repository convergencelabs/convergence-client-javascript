import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface RequestPresence extends OutgoingProtocolRequestMessage {
  userIds: string[];
}

export var RequestPresenceSerializer: MessageBodySerializer = (request: RequestPresence) => {
  return {
    u: request.userIds
  };
};

export interface RequestPresenceResponse extends IncomingProtocolNormalMessage {
  // TODO: Implement
}

export var RequestPresenceResponseDeserializer: MessageBodyDeserializer<RequestPresenceResponse> = (body: any) => {
  var result: RequestPresenceResponse = {
    // TODO: Implement
  };
  return result;
};
