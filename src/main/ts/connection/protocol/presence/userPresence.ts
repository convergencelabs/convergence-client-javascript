import {IncomingProtocolNormalMessage} from "../protocol";
import {OutgoingProtocolNormalMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {UserPresence} from "../../../presence/UserPresence";

export var UserPresenceDeserializer: (up: any) => UserPresence = (up: any) => {
  return new UserPresence(up.u, up.a, up.s);
};
