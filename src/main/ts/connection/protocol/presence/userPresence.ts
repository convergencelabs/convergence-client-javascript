import {UserPresence} from "../../../presence/UserPresence";

export var UserPresenceDeserializer: (up: any) => UserPresence = (up: any) => {
  return new UserPresence(up.username, up.available, up.state);
};
