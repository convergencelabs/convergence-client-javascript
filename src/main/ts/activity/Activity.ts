import {Session} from "../Session";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {MessageType} from "../connection/protocol/MessageType";
import {ActivityJoinRequest} from "../connection/protocol/activity/joinActivity";
import {ActivityLeaveRequest} from "../connection/protocol/activity/leaveActivity";
import {SessionIdParser} from "../connection/protocol/SessionIdParser";
import {ActivityEvent} from "./events";
import {Observable} from "rxjs/Rx";
import {ActivitySetState} from "../connection/protocol/activity/activityState";
import {ActivityClearState} from "../connection/protocol/activity/activityState";
import {ActivityParticipant} from "./ActivityParticipant";
import {ParticipantsRequest} from "../connection/protocol/activity/participants";
import {ParticipantsResponse} from "../connection/protocol/activity/participants";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

export class Activity extends ConvergenceEventEmitter<ActivityEvent> {

  static Events: any = {
    SESSION_JOINED: "session_joined",
    SESSION_LEFT: "session_left",
    STATE_SET: "state_set",
    STATE_CLEARED: "state_cleared"
  };

  private _id: string;
  private _connection: () => void;
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

    this.events().subscribe(event => {
      //TODO: handle updating the behavior subject
    });

  }

  session(): Session {
    return this._connection.session();
  }

  id(): string {
    return this._id;
  }

  leave(): void {
    if (this.isJoined()) {
      this._joined = true;
      this._connection.send(<ActivityLeaveRequest>{
        type: MessageType.ACTIVITY_LEAVE_REQUEST,
        activityId: this._id
      });
      this._leftCB();
    }
  }

  isJoined(): boolean {
    return this._joined;
  }

  publish(state: Map<string, any>): void
  publish(key: string, value: any): void
  publish(): void {
    var state: Map<string, any>;
    if (arguments.length === 1) {
      state = arguments[0];
    } else if (arguments.length === 2) {
      state = new Map<string, any>();
      state[arguments[0]] = arguments[1];
    }
    if (this.isJoined()) {
      var message: ActivitySetState = {
        type: MessageType.ACTIVITY_LOCAL_STATE_SET,
        activityId: this._id,
        state: state
      };
      this._connection.send(message);
    }
  }

  clear(key: string): void
  clear(keys: string[]): void
  clear(keys: string | string[]): void {
    if (typeof keys === "string") {
      keys = [<string>keys];
    }

    if (this.isJoined()) {
      var message: ActivityClearState = {
        type: MessageType.ACTIVITY_LOCAL_STATE_CLEARED,
        activityId: this._id,
        keys: <string[]>keys
      };
      this._connection.send(message);
    }
  }

  participant(id): ActivityParticipant {
    return this._participants.getValue().get(id);
  }

  participants(): ActivityParticipant[] {
    return this._participants.getValue().values();
  }

  asObservable(): Observable<ActivityParticipant[]> {
    //TODO: probably need to order this so we get consistent results on subsequent calls
    return this._participants.asObservable().map(mappedValues => mappedValues.values());
  }
}

export interface ActivityJoinOptions {
  state?: Map<string, any>;
}
