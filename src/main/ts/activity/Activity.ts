import { ConvergenceEventEmitter } from "../util/ConvergenceEventEmitter";
import { ConvergenceConnection } from "../connection/ConvergenceConnection";
import { BehaviorSubject } from "rxjs/Rx";
import { ActivityParticipant } from "./ActivityParticipant";
import { Observable } from "rxjs/Observable";
import { ActivityEvent, SessionJoinedEvent, SessionLeftEvent, StateSetEvent, StateClearedEvent } from "./events";
import { Session } from "../Session";
import { MessageType } from "../connection/protocol/MessageType";
import { ActivityLeaveRequest } from "../connection/protocol/activity/leaveActivity";
import { ActivitySetState, ActivityClearState } from "../connection/protocol/activity/activityState";
import { ActivityRemoveState } from "../connection/protocol/activity/activityState";
import { StateRemovedEvent } from "./events";
import { mapToObject } from "../util/ObjectUtils";

export interface ActivityEvents {
  SESSION_JOINED: string;
  SESSION_LEFT: string;
  STATE_SET: string;
  STATE_REMOVED: string;
  STATE_CLEARED: string;
}

export class Activity extends ConvergenceEventEmitter<ActivityEvent> {

  public static readonly Events: ActivityEvents = {
    SESSION_JOINED: SessionJoinedEvent.NAME,
    SESSION_LEFT: SessionLeftEvent.NAME,
    STATE_SET: StateSetEvent.NAME,
    STATE_REMOVED: StateRemovedEvent.NAME,
    STATE_CLEARED: StateClearedEvent.NAME
  };

  private _id: string;
  private _leftCB: () => void;
  private _joined: boolean;
  private _connection: ConvergenceConnection;
  private _participants: BehaviorSubject<Map<string, ActivityParticipant>>;

  constructor(id: string,
              participants: Map<string, ActivityParticipant>,
              leftCB: () => void,
              eventStream: Observable<ActivityEvent>,
              connection: ConvergenceConnection) {
    super();
    this._emitFrom(eventStream);
    this._id = id;
    this._participants = new BehaviorSubject<Map<string, ActivityParticipant>>(participants);
    this._leftCB = leftCB;
    this._joined = true;
    this._connection = connection;

    this.events().subscribe((event: ActivityEvent) => {
      let newMap: Map<string, ActivityParticipant> = this._participants.getValue();
      switch (event.name) {
        case Activity.Events.SESSION_JOINED:
          let joinedEvent: SessionJoinedEvent = <SessionJoinedEvent> event;
          newMap.set(joinedEvent.sessionId, joinedEvent.participant);
          this._participants.next(newMap);
          break;
        case Activity.Events.SESSION_LEFT:
          let leftEvent: SessionLeftEvent = <SessionLeftEvent> event;
          newMap.delete(leftEvent.sessionId);
          this._participants.next(newMap);
          break;
        case Activity.Events.STATE_SET:
          let setEvent: StateSetEvent = <StateSetEvent> event;
          let setState: Map<string, any> = newMap.get(setEvent.sessionId).state();
          setState.set(setEvent.key, setEvent.value);
          newMap.set(
            setEvent.sessionId,
            new ActivityParticipant(setEvent.sessionId, setEvent.username, setState, false));
          this._participants.next(newMap);
          break;
        case Activity.Events.STATE_REMOVED:
          let removeEvent: StateRemovedEvent = <StateRemovedEvent> event;
          let removeState: Map<string, any> = newMap.get(removeEvent.sessionId).state();
          removeState.delete(removeEvent.key);
          newMap.set(removeEvent.sessionId,
            new ActivityParticipant(removeEvent.sessionId, removeEvent.username, removeState, false));
          this._participants.next(newMap);
          break;
        case Activity.Events.STATE_CLEARED:
          let clearEvent: StateClearedEvent = <StateClearedEvent> event;
          newMap.set(clearEvent.sessionId,
            new ActivityParticipant(clearEvent.sessionId, clearEvent.username, new Map<string, any>(), false));
          this._participants.next(newMap);
          break;
        default:
          // This should be impossible
          throw new Error("Invalid activity event");
      }
    });
  }

  public session(): Session {
    return this._connection.session();
  }

  public id(): string {
    return this._id;
  }

  public leave(): void {
    if (this.isJoined()) {
      this._joined = false;
      this._connection.send(<ActivityLeaveRequest> {
        type: MessageType.ACTIVITY_LEAVE_REQUEST,
        activityId: this._id
      });
      this._leftCB();
    }
  }

  public isJoined(): boolean {
    return this._joined;
  }

  public state(key: string): any;
  public state(): {[key: string]: any};
  public state(key?: string): any {
    const localParticipant: ActivityParticipant =
      this._participants.getValue().get(this._connection.session().sessionId());
    if (typeof key === "undefined") {
      return mapToObject(localParticipant.state());
    } else {
      return localParticipant.state().get(key);
    }
  }

  public setState(state: {[key: string]: any}): void
  public setState(key: string, value: any): void
  public setState(): void {
    if (this.isJoined()) {
      let state: {[key: string]: any};
      if (arguments.length === 1) {
        state = arguments[0];
      } else if (arguments.length === 2) {
        state = {};
        state[arguments[0]] = arguments[1];
      }

      const message: ActivitySetState = {
        type: MessageType.ACTIVITY_LOCAL_STATE_SET,
        activityId: this._id,
        state
      };
      this._connection.send(message);

      Object.keys(state).forEach((key) => {
        this._emitEvent(new StateSetEvent (
          this.id(),
          this._connection.session().username(),
          this._connection.session().sessionId(),
          true,
          key,
          state[key]
        ));
      });
    }
  }

  public removeState(key: string): void
  public removeState(keys: string[]): void
  public removeState(keys: string | string[]): void {
    if (this.isJoined()) {
      if (typeof keys === "string") {
        keys = [<string> keys];
      }

      const message: ActivityRemoveState = {
        type: MessageType.ACTIVITY_LOCAL_STATE_REMOVED,
        activityId: this._id,
        keys: <string[]> keys
      };
      this._connection.send(message);

      (<string[]> keys).forEach((key) => {
        this._emitEvent(new StateRemovedEvent(
          this.id(),
          this._connection.session().username(),
          this._connection.session().sessionId(),
          true,
          key
        ));
      });
    }
  }

  public clearState(): void {
    if (this.isJoined()) {
      const message: ActivityClearState = {
        type: MessageType.ACTIVITY_LOCAL_STATE_CLEARED,
        activityId: this._id,
      };
      this._connection.send(message);

      this._emitEvent(new StateClearedEvent(
        this.id(),
        this._connection.session().username(),
        this._connection.session().sessionId(),
        true
    ));
    }
  }

  public participant(id: string): ActivityParticipant {
    return this._participants.getValue().get(id);
  }

  public participants(): ActivityParticipant[] {
    return Array.from(this._participants.getValue().values());
  }

  public participantsAsObservable(): Observable<ActivityParticipant[]> {
    return this._participants.asObservable().map(mappedValues => Array.from(mappedValues.values()));
  }
}
Object.freeze(Activity.Events);
