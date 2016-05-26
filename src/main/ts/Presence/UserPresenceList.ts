import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {UserPresence} from "./UserPresence";

var Events: any = {
  USER_AVAILABLE: "user_available",
  USER_UNAVAILABLE: "user_unavailable",
  USER_STATE_CHANGED: "user_state_changed",
  SESSION_AVAILABLE: "session_available",
  SESSION_UNAVAILABLE: "session_unavailable"
};
Object.freeze(Events);

export class UserPresenceList extends ConvergenceEventEmitter {

  constructor() {
    super();
  }

  users(): UserPresence[] {
    return;
  }

  user(userId: string): UserPresence {
    return;
  }

  contains(userId: string): boolean {
    return false;
  }

  addUser(userId: string): void {

  }

  removeUser(userId: string): void {

  }

  isDisposed(): boolean {
    return false;
  }

  dispose(): void {
    return;
  }
}
