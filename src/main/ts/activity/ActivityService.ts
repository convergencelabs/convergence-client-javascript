import {Session} from "../Session";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Activity} from "./Activity";
import {MessageType} from "../connection/protocol/MessageType";
import {MessageEvent} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs/Rx";
import {SessionJoinedEvent, SessionLeftEvent, StateClearedEvent, StateSetEvent} from "./events";
import {ActivitySessionJoined} from "../connection/protocol/activity/sessionJoined";
import {ActivitySessionLeft} from "../connection/protocol/activity/sessionLeft";
import {ActivityRemoteStateSet, ActivityRemoteStateCleared} from "../connection/protocol/activity/activityState";
import {ActivityEvent} from "./events";
import {SessionIdParser} from "../connection/protocol/SessionIdParser";
import {ActivityParticipant} from "./ActivityParticipant";

export class ActivityService {

  private _connection: ConvergenceConnection;
  private _eventStream: Observable<ActivityEvent>;
  private _joinedMap: Map<string, boolean>;

  constructor(connection: ConvergenceConnection) {
    this._connection = connection;

    let messageObs: Observable<MessageEvent> = Observable.create(observer => {
      this._connection.addMultipleMessageListener(
        [MessageType.ACTIVITY_SESSION_JOINED,
        MessageType.ACTIVITY_SESSION_LEFT,
        MessageType.ACTIVITY_REMOTE_STATE_SET,
        MessageType.ACTIVITY_REMOTE_STATE_CLEARED],
        (event) => {
        observer.next(event);
      });
    });

    this._eventStream = messageObs.pluck("message").concatMap(message => {
      let msg: any = message;
      switch (msg.type) {
        case MessageType.ACTIVITY_SESSION_JOINED:
          let joinedMsg: ActivitySessionJoined = <ActivitySessionJoined> message;
          let username: string = SessionIdParser.parseUsername(joinedMsg.sessionId);
          let participant: ActivityParticipant = new ActivityParticipant(
            username,
            joinedMsg.sessionId,
            joinedMsg.state);
          return [<SessionJoinedEvent> {
            src: this,
            name: Activity.Events.SESSION_JOINED,
            activityId: joinedMsg.activityId,
            username: username,
            sessionId: joinedMsg.sessionId,
            participant: participant,
            local: false
          }];
        case MessageType.ACTIVITY_SESSION_LEFT:
          let leftMsg: ActivitySessionLeft = <ActivitySessionLeft> message;
          return [<SessionLeftEvent> {
            name: Activity.Events.SESSION_LEFT,
            activityId: leftMsg.activityId,
            username: SessionIdParser.parseUsername(leftMsg.sessionId),
            sessionId: leftMsg.sessionId,
            local: false
          }];
        case MessageType.ACTIVITY_REMOTE_STATE_SET:
          let stateSetMsg: ActivityRemoteStateSet = <ActivityRemoteStateSet> message;
          return Object.keys(stateSetMsg.state).map((key) => {
            return <StateSetEvent> {
              name: Activity.Events.STATE_SET,
              activityId: stateSetMsg.activityId,
              username: SessionIdParser.parseUsername(stateSetMsg.sessionId),
              sessionId: stateSetMsg.sessionId,
              key: key,
              value: stateSetMsg.state[key],
              local: false
            };
          });
        case MessageType.ACTIVITY_REMOTE_STATE_CLEARED:
          let stateClearedMsg: ActivityRemoteStateCleared = <ActivityRemoteStateCleared> message;
          return Object.keys(stateClearedMsg.keys).map((key) => {
            return <StateClearedEvent> {
              name: Activity.Events.STATE_CLEARED,
              activityId: stateClearedMsg.activityId,
              username: SessionIdParser.parseUsername(stateClearedMsg.sessionId),
              sessionId: stateClearedMsg.sessionId,
              key: key,
              local: false
            };
          });
        default:
        // This should be impossible
          throw new Error("Invalid activity event");
      }
    });

    this._joinedMap = new Map<string, boolean>();
  }

  session(): Session {
    return this._connection.session();
  }

  activity(id: string): Activity {
    return new Activity(id,
      this._joinCB(id), this._leftCB(id), this._isJoined(id),
      this.eventStream().filter(event => {
        return event.activityId === id;
      }),
      this._connection);
  }

  joined(): {[key: string]: Activity} {
    var joined: {[key: string]: Activity} = {};
    Object.keys(this._joinedMap).forEach(id => {
        joined[id] = this.activity(id);
    });
    return joined;
  }

  isJoined(id: string): boolean {
    return this._joinedMap.has(id);
  }

  eventStream(): Observable<ActivityEvent> {
    return this._eventStream;
  }

  private _joinCB: (id: string) => () => void = (id: string) => {
    return () => this._joinedMap.set(id, true);
  };

  private _leftCB: (id: string) => () => void = (id: string) => {
    return () => this._joinedMap.delete(id);
  };

  private _isJoined: (id: string) => () => boolean = (id: string) => {
    return () => this._joinedMap.has(id);
  };
}
