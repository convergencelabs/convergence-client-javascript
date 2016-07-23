import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface PresenceAvailabilityChanged extends IncomingProtocolNormalMessage {
  userId: string;
  available: boolean;
}

export var PresenceAvailabilityChangedDeserializer: MessageBodyDeserializer<PresenceAvailabilityChanged> = (body: any) => {
  var result: PresenceAvailabilityChanged = {
    userId: body.u,
    available: body.a
  };
  return result;
};
