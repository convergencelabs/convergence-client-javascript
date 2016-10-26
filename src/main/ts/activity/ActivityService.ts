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
import {ActivityJoinOptions} from "./Activity";
import {ActivityJoinRequest} from "../connection/protocol/activity/joinActivity";
import {ParticipantsResponse} from "../connection/protocol/activity/participants";
import {ActivityJoinResponse} from "../connection/protocol/activity/joinActivity";
import {Deferred} from "../util/Deferred";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";

export class ActivityService extends ConvergenceEventEmitter {

  private _connection: ConvergenceConnection;
  private _joinedMap: Map<string, Deferred<Activity>>;

  constructor(connection: ConvergenceConnection) {
    super();
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

    let eventStream = messageObs.pluck("message").concatMap(message => {
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
          return stateClearedMsg.keys.map((key) => {
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

    this._emitFrom(eventStream);
    this._joinedMap = new Map();
  }

  session(): Session {
    return this._connection.session();
  }

  join(id: string, options?: ActivityJoinOptions): Promise<Activity> {
    if (!this.isJoined(id)) {
      if (options === undefined) {
        options = <ActivityJoinOptions> {
          state: new Map<string, any>()
        };
      }
      let deferred: Deferred<Activity> = new Deferred<Activity>();
      this._joinedMap.set(id, deferred);
      this._connection.request(<ActivityJoinRequest>{
        type: MessageType.ACTIVITY_JOIN_REQUEST,
        activityId: id,
        state: options.state
      }).then(function (response: ActivityJoinResponse) {
        this._joinedMap.set(id, true);
        var participants: Map<string, ActivityParticipant> = new Map();
        Object.keys(response.participants).forEach((sessionId: string) => {
          var username: string = SessionIdParser.parseUsername(sessionId);
          participants.set(sessionId, new ActivityParticipant(username, sessionId, <Map<string, any>>response.participants[sessionId]));
        });

        deferred.resolve(new Activity(id, participants, this._leftCB(id), this.events().filter(event => {
            return event.activityId === id;
          }),
          this._connection));
      });
    }

    //TODO: validate that this works
    return this._joinedMap.get(id).promise();
  }

  joined(): Map<string, Activity> {
    return Object.assign({}, this._joinedMap);
  }

  isJoined(id: string): boolean {
    return this._joinedMap.has(id);
  }

  private _leftCB: (id: string) => () => void = (id: string) => {
    return () => this._joinedMap.delete(id);
  };
}
