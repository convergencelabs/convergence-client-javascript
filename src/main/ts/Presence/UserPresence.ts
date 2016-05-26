import {RemoteSession} from "../RemoteSession";

var Events: any = {
  USER_AVAILABLE: "user_available",
  USER_UNAVAILABLE: "user_unavailable",
  USER_STATE_CHANGED: "user_state_changed",
  SESSION_AVAILABLE: "session_available",
  SESSION_UNAVAILABLE: "session_unavailable"
};
Object.freeze(Events);

export class UserPresence {

  static Events: any = Events;

  userId(): string {
    return;
  }

  sessions(): RemoteSession[] {
    return [];
  }

  available(): boolean {
    return false;
  }

  states(): {[key: string]: any} {
    return {};
  }

  state(key: string): any {
    return;
  }
}
