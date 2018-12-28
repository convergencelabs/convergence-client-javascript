import {ActivityParticipant} from "./ActivityParticipant";
import {
  IActivityEvent,
  ActivitySessionJoinedEvent,
  ActivitySessionLeftEvent,
  ActivityStateSetEvent,
  ActivityStateClearedEvent,
  ActivityStateRemovedEvent
} from "./events";
import {StringMap, StringMapLike, ConvergenceEventEmitter} from "../util/";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable, BehaviorSubject} from "rxjs";
import {map} from "rxjs/operators";
import {ConvergenceSession} from "../ConvergenceSession";
import {MessageType} from "../connection/protocol/MessageType";
import {ActivityLeaveRequest} from "../connection/protocol/activity/leaveActivity";
import {
  ActivitySetState,
  ActivityClearState,
  ActivityRemoveState
} from "../connection/protocol/activity/activityState";

/**
 * The [[Activity]] class represents a activity that the users of a
 * collaboration are participating in together. The activity allows
 * developer to indicate what user are doing within a collaborative
 * application. The activity has a set of participants that indicate
 * which users are part of that activity. Each [[ActivityParticipant]]
 * can share state which indicates what they are doing within the
 * [[Activity]].
 */
export class Activity extends ConvergenceEventEmitter<IActivityEvent> {

  /**
   * Holds the constants for the event names that are fired by the Activity
   * class.
   */
  public static readonly Events = {
    /**
     * Fired when a remote session joins the activity. The resulting event will
     * be an instance of the [[ActivitySessionJoinedEvent]] class.
     *
     * @event [ActivitySessionJoinedEvent]{@link ActivitySessionJoinedEvent}
     */
    SESSION_JOINED: ActivitySessionJoinedEvent.EVENT_NAME,

    /**
     * Fired when a remote session leaves the activity. The resulting event will
     * be an instance of the {@link ActivitySessionLeftEvent} class.
     *
     * @event [SessionLeftEvent]{@link ActivitySessionLeftEvent}
     */
    SESSION_LEFT: ActivitySessionLeftEvent.EVENT_NAME,

    /**
     * Fired when a remote session sets state within the Activity. The resulting
     * event will be an instance of the {@link ActivityStateSetEvent} class.
     *
     * @event [StateSetEvent]{@link ActivityStateSetEvent}
     */
    STATE_SET: ActivityStateSetEvent.EVENT_NAME,

    /**
     * Fired when a remote session clears state within the Activity. The resulting
     * event will be an instance of the {@link ActivityStateClearedEvent} class.
     *
     * @event [StateClearedEvent]{@link ActivityStateClearedEvent}
     */
    STATE_CLEARED: ActivityStateClearedEvent.EVENT_NAME,

    /**
     * Fired when a remote session clears state within the Activity. The resulting
     * event will be an instance of the {@link ActivityStateRemovedEvent} class.
     *
     * @event [StateClearedEvent]{@link ActivityStateRemovedEvent}
     */
    STATE_REMOVED: ActivityStateRemovedEvent.EVENT_NAME
  };

  /**
   * @internal
   */
  private readonly _id: string;

  /**
   * @internal
   */
  private readonly _leftCB: () => void;

  /**
   * @internal
   */
  private _joined: boolean;

  /**
   * @internal
   */
  private _connection: ConvergenceConnection;

  /**
   * @internal
   */
  private _participants: BehaviorSubject<Map<string, ActivityParticipant>>;

  /**
   * @hidden
   * @internal
   */
  constructor(id: string,
              participants: Map<string, ActivityParticipant>,
              leftCB: () => void,
              eventStream: Observable<IActivityEvent>,
              connection: ConvergenceConnection) {
    super();
    this._emitFrom(eventStream);
    this._id = id;
    this._participants = new BehaviorSubject<Map<string, ActivityParticipant>>(participants);
    this._leftCB = leftCB;
    this._joined = true;
    this._connection = connection;

    this.events().subscribe((event: IActivityEvent) => {
      const newMap: Map<string, ActivityParticipant> = this._participants.getValue();

      if (event instanceof ActivitySessionJoinedEvent) {
        newMap.set(event.sessionId, event.participant);
        this._participants.next(newMap);
      } else if (event instanceof ActivitySessionLeftEvent) {
        newMap.delete(event.sessionId);
        this._participants.next(newMap);
      } else if (event instanceof ActivityStateSetEvent) {
        const setState: Map<string, any> = newMap.get(event.sessionId).state;
        setState.set(event.key, event.value);
        newMap.set(
          event.sessionId,
          new ActivityParticipant(this, event.sessionId, event.username, false, setState));
        this._participants.next(newMap);
      } else if (event instanceof ActivityStateRemovedEvent) {
        const removeState: Map<string, any> = newMap.get(event.sessionId).state;
        removeState.delete(event.key);
        newMap.set(event.sessionId,
          new ActivityParticipant(this, event.sessionId, event.username, false, removeState));
        this._participants.next(newMap);
      } else if (event instanceof ActivityStateClearedEvent) {
        newMap.set(event.sessionId,
          new ActivityParticipant(this, event.sessionId, event.username, false, new Map<string, any>()));
        this._participants.next(newMap);
      } else {
        // This should be impossible
        throw new Error("Invalid activity event");
      }
    });
  }

  /**
   * Gets the session that this activity is a part of.
   *
   * @returns
   *   The session that this [[Activity]] is a part of.
   */
  public session(): ConvergenceSession {
    return this._connection.session();
  }

  /**
   * Gets the unique id of this [[Activity]].
   *
   * @returns
   *   The [[Activity]] id.
   */
  public id(): string {
    return this._id;
  }

  /**
   * Causes the local session to leave the [[Activity]]. All other participants
   * of this activity will be notified that this session has left. The state
   * associated with this session will be removed from eh [[Activity]]. After
   * calling leave, the [[Activity]] object becomes non-functional. The local
   * user can rejoin the activity from the [[ActivityService]] but will
   * receive a new [[Activity]] object.
   */
  public leave(): void {
    if (this.isJoined()) {
      this._joined = false;
      this._connection.send({
        type: MessageType.ACTIVITY_LEAVE_REQUEST,
        activityId: this._id
      } as ActivityLeaveRequest);
      this._leftCB();
    }
  }

  /**
   * Determines if the [[Activity]] is still joined.
   *
   * @returns
   *   True if the [[Activity]] is joined, false otherwise.
   */
  public isJoined(): boolean {
    return this._joined;
  }

  /**
   * Gets the local session's state within this [[Activity]].
   *
   * @returns
   *   The local sessions state.
   */
  public state(): Map<string, any> {
    const localParticipant: ActivityParticipant =
      this._participants.getValue().get(this._connection.session().sessionId());
    return localParticipant.state;
  }

  /**
   * Sets a single key-value pair within this Activity's local state.
   *
   * ```typescript
   * activity.setState("key1", "value");
   * ```
   *
   * @param key
   *   The key of the value to set.
   * @param value
   *   The value to set for the supplied key.
   */
  public setState(key: string, value: any): void;

  /**
   * Sets multiple key-value pairs within this Activity's local state. This
   * method does not replace all state; that is, keys not supplied in the map
   * will not be altered.
   *
   * ```typescript
   * const state = {
   *   key1: "v1",
   *   key2: false
   * };
   * activity.setState(state);
   * ```
   * or
   *
   * ```typescript
   * const state = new Map();
   * state.set("key1", "v1");
   * state.set("key2", false);
   * activity.setState(state);
   * ```
   * @param state
   *   A map containing the key-value pairs to set.
   */
  public setState(state: StringMapLike): void;

  public setState(): void {
    if (this.isJoined()) {
      let state: { [key: string]: any };
      if (arguments.length === 1) {
        state = StringMap.coerceToObject(arguments[0]);
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
        this._emitEvent(new ActivityStateSetEvent(
          this,
          this._connection.session().username(),
          this._connection.session().sessionId(),
          true,
          key,
          state[key]
        ));
      });
    }
  }

  /**
   * Removes a single local state entry from the [[Activity]].
   *
   * ```typescript
   * activity.removeState("pointer");
   * ```
   *
   * @param key
   *   The key of the local state to remove.
   */
  public removeState(key: string): void;

  /**
   * Removes one or more local state entries from the [[Activity]].
   *
   * ```typescript
   * activity.removeState(["pointer", "viewport"]);
   * ```
   *
   * @param keys
   *   The keys of the local state to remove.
   */
  public removeState(keys: string[]): void;

  public removeState(keys: string | string[]): void {
    if (this.isJoined()) {
      if (typeof keys === "string") {
        keys = [keys as string];
      }

      const message: ActivityRemoveState = {
        type: MessageType.ACTIVITY_LOCAL_STATE_REMOVED,
        activityId: this._id,
        keys: keys as string[]
      };
      this._connection.send(message);

      (keys as string[]).forEach((key) => {
        this._emitEvent(new ActivityStateRemovedEvent(
          this,
          this._connection.session().username(),
          this._connection.session().sessionId(),
          true,
          key
        ));
      });
    }
  }

  /**
   * Removes all local state from this [[Activity]].
   */
  public clearState(): void {
    if (this.isJoined()) {
      const message: ActivityClearState = {
        type: MessageType.ACTIVITY_LOCAL_STATE_CLEARED,
        activityId: this._id
      };
      this._connection.send(message);

      this._emitEvent(new ActivityStateClearedEvent(
        this,
        this._connection.session().username(),
        this._connection.session().sessionId(),
        true
      ));
    }
  }

  /**
   * Gets an [[ActivityParticipant]] by their sessionId.
   *
   * @param sessionId
   *   The sessionId of the participant to get.
   * @returns
   *   The [[ActivityParticipant]] corresponding to the supplied id, or
   *   undefined if no such participant exists.
   */
  public participant(sessionId: string): ActivityParticipant {
    return this._participants.getValue().get(sessionId);
  }

  /**
   * Gets all participants presently joined to this [[Activity]].
   */
  public participants(): ActivityParticipant[] {
    return Array.from(this._participants.getValue().values());
  }

  /**
   * Gets the participants as an Observable stream.
   *
   * ```typescript
   * activity
   *   .participantsAsObservable()
   *   .subscribe(p => console.log(p));
   * ```
   *
   * @returns
   *   An Observable array of participants.
   */
  public participantsAsObservable(): Observable<ActivityParticipant[]> {
    return this._participants
      .asObservable()
      .pipe(map(mappedValues => Array.from(mappedValues.values())));
  }

  /**
   * @param participants
   *    The participants to set.
   * @internal
   * @hidden
   */
  public _setParticipants(participants: Map<string, ActivityParticipant>) {
    this._participants.next(participants);
  }
}

Object.freeze(Activity.Events);
