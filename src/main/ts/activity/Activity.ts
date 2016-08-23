import {Session} from "../Session";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
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

export class Activity extends ConvergenceEventEmitter {

  static Events: any = {
    USER_JOINED: "user_joined",
    USER_LEFT: "user_left",
    SESSION_JOINED: "session_joined",
    SESSION_LEFT: "session_left",
    STATE_SET: "state_set",
    STATE_CLEARED: "state_cleared"
  };

  private _id: string;
  private _joinCB: () => void;
  private _leftCB: () => void;
  private _isJoined: () => boolean;
  private _connection: ConvergenceConnection;
  private _eventStream: Observable<ActivityEvent>;


  constructor(id: string,
              joinCB: () => void,
              leftCB: () => void,
              isJoined: () => boolean,
              eventStream: Observable<ActivityEvent>,
              connection: ConvergenceConnection) {
    super();
    this._id = id;
    this._joinCB = joinCB;
    this._leftCB = leftCB;
    this._isJoined = isJoined;
    this._eventStream = eventStream;
    this._connection = connection;
  }

  session(): Session {
    return this._connection.session();
  }

  id(): string {
    return this._id;
  }

  join(): void {
    if (!this._isJoined()) {
      this._connection.send(<ActivityJoinRequest>{
        type: MessageType.ACTIVITY_JOIN_REQUEST,
        activityId: this._id
      });
      this._joinCB();
    }
  }

  leave(): void {
    if (this._isJoined()) {
      this._connection.send(<ActivityLeaveRequest>{
        type: MessageType.ACTIVITY_LEAVE_REQUEST,
        activityId: this._id
      });
      this._leftCB();
    }
  }

  isJoined(): boolean {
    return this._isJoined();
  }

  publish(key: string, value: any): void {
    if (this._isJoined()) {
      var message: ActivitySetState = {
        type: MessageType.ACTIVITY_LOCAL_STATE_SET,
        activityId: this._id,
        key: key,
        value: value
      };
      this._connection.send(message);

      // var event: ActivityRemoteStateSetEvent = {
      //  src: this,
      //  name: ActivityStateMap.Events.STATE_SET,
      //  username: SessionIdParser.parseUsername(sessionId),
      //  sessionId: sessionId,
      //  key: key,
      //  value: value,
      //  local: true
      // };
      // this.emitEvent(event);
    }
  }

  clear(key: string): void {
    if (this._isJoined()) {
      var message: ActivityClearState = {
        type: MessageType.ACTIVITY_LOCAL_STATE_CLEARED,
        activityId: this._id,
        key: key
      };
      this._connection.send(message);
    }

    // var event: ActivityRemoteStateClearedEvent = {
    //  src: this,
    //  name: ActivityStateMap.Events.STATE_CLEARED,
    //  username: SessionIdParser.parseUsername(sessionId),
    //  sessionId: sessionId,
    //  key: key,
    //  local: true
    // };
    // this.emitEvent(event);
  }

  clearAll(): void {
    // TODO: Implement Clear All Message
  }

  participants(): Observable<ActivityParticipant[]> {

    var participantRequest: ParticipantsRequest = {
      type: MessageType.ACTIVITY_PARTICIPANTS_REQUEST,
      activityId: this._id
    };

    return Observable.fromPromise(this._connection.request(participantRequest)).map((response: ParticipantsResponse) => {
      var participants: ActivityParticipant[] = [];
      Object.keys(response.participants).forEach((sessionId: string) => {
        var username: string = SessionIdParser.parseUsername(sessionId);
        participants.push(new ActivityParticipant(username, sessionId, <Map<string, any>>response.participants[sessionId]));
      });
      return participants;
    });
  }

  events(): Observable<ActivityEvent> {
    return this._eventStream;
  }
}


