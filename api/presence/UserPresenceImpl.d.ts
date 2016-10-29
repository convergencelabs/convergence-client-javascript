import {UserPresence} from "./UserPresence";

export class UserPresenceImpl implements UserPresence {
  username(): string;

  isAvailable(): boolean;

  state(key: string): any;

  state(): Map<string, any>;
}
