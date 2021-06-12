/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {ActivityParticipant} from "./ActivityParticipant";
import {
  ActivitySessionJoinedEvent,
  ActivitySessionLeftEvent,
  ActivityStateClearedEvent,
  ActivityStateDeltaEvent,
  ActivityStateRemovedEvent,
  ActivityStateSetEvent,
  IActivityEvent
} from "./events";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {map} from "rxjs/operators";
import {ConvergenceSession} from "../ConvergenceSession";
import {mapObjectValues, objectForEach} from "../util/ObjectUtils";
import {
  getOrDefaultArray,
  getOrDefaultBoolean,
  getOrDefaultNumber,
  getOrDefaultObject,
  getOrDefaultString,
  jsonToProtoValue,
  protoValueToJson
} from "../connection/ProtocolUtil";
import {IdentityCache} from "../identity/IdentityCache";
import {ActivityLeftEvent} from "./events/ActivityLeftEvent";
import {Deferred} from "../util/Deferred";
import {IActivityJoinOptions} from "./IActivityJoinOptions";
import {ConvergenceEventEmitter} from "../util/";
import {TypeChecker} from "../util/TypeChecker";
import {EqualsUtil} from "../util/EqualsUtil";
import {Logger} from "../util/log/Logger";
import {Logging} from "../util/log/Logging";
import {StringMap, StringMapLike} from "../util/StringMap";

import {com} from "@convergence/convergence-proto";
import {ConvergenceError} from "../util";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;
import IActivitySessionJoinedMessage = com.convergencelabs.convergence.proto.activity.IActivitySessionJoinedMessage;
import IActivitySessionLeftMessage = com.convergencelabs.convergence.proto.activity.IActivitySessionLeftMessage;
import IActivityStateUpdatedMessage = com.convergencelabs.convergence.proto.activity.IActivityStateUpdatedMessage;

/**
 * The [[Activity]] class represents a activity that the users of a
 * collaboration are participating in together. The activity allows
 * developer to indicate what user are doing within a collaborative
 * application. The activity has a set of participants that indicate
 * which users are part of that activity. Each [[ActivityParticipant]]
 * can share state which indicates what they are doing within the
 * [[Activity]].
 *
 * @module Activities
 */
export class Activity extends ConvergenceEventEmitter<IActivityEvent> {

  /**
   * Holds the constants for the event names that are fired by the Activity
   * class.
   */
  public static readonly Events = {
    /**
     * Fired when a remote session joins the activity. The resulting event will
     * be an [[ActivitySessionJoinedEvent]].
     *
     * @event [[ActivitySessionJoinedEvent]]
     */
    SESSION_JOINED: ActivitySessionJoinedEvent.EVENT_NAME,

    /**
     * Fired when a remote session leaves the activity. The resulting event will
     * be an [[ActivitySessionLeftEvent]].
     *
     * @event [[ActivitySessionLeftEvent]]
     */
    SESSION_LEFT: ActivitySessionLeftEvent.EVENT_NAME,

    /**
     * Fired when a remote session sets state within the Activity. The resulting
     * event will be an [[ActivityStateSetEvent]].
     *
     * @event [[ActivityStateSetEvent]]
     */
    STATE_SET: ActivityStateSetEvent.EVENT_NAME,

    /**
     * Fired when a remote session clears state within the Activity. The resulting
     * event will be an [[ActivityStateClearedEvent]].
     *
     * @event [[ActivityStateClearedEvent]]
     */
    STATE_CLEARED: ActivityStateClearedEvent.EVENT_NAME,

    /**
     * Fired when a remote session clears state within the Activity. The resulting
     * event will be an [[ActivityStateRemovedEvent]].
     *
     * @event [[ActivityStateRemovedEvent]]
     */
    STATE_REMOVED: ActivityStateRemovedEvent.EVENT_NAME,

    /**
     * Fired when a remote session makes any changes to state within Activity. The
     * resulting event will be a [[ActivityStateDeltaEvent]].
     *
     * This is a batch event whereas [[ActivityStateClearedEvent]] and
     * [[ActivityStateSetEvent]] are fired for individual properties.
     *
     * @event [[ActivityStateSetEvent]]
     */
    STATE_DELTA: ActivityStateRemovedEvent.EVENT_NAME,

    /**
     * Fired when a the activity is left by the local session. The resulting event
     * will be an [[ActivityLeftEvent]].
     *
     * @event [[ActivityLeftEvent]]
     */
    LEFT: ActivityLeftEvent.EVENT_NAME
  };

  /**
   * @internal
   */
  private readonly _id: string;

  /**
   * @internal
   */
  private _resource: number | null;

  /**
   * @internal
   */
  private readonly _identityCache: IdentityCache;

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
   * @internal
   */
  private _localParticipant: ActivityParticipant;

  /**
   * @internal
   */
  private _connectionMessageSubscription: Subscription;

  /**
   * @internal
   */
  private readonly _logger: Logger;

  /**
   * @internal
   */
  private _joinPromise: Promise<void> | null;

  /**
   * @hidden
   * @internal
   */
  constructor(id: string,
              identityCache: IdentityCache,
              connection: ConvergenceConnection) {
    super();
    this._identityCache = identityCache;
    this._id = id;
    this._resource = null;

    this._participants = new BehaviorSubject<Map<string, ActivityParticipant>>(new Map());
    this._joined = true;
    this._connection = connection;
    this._logger = Logging.logger("activities.activity");
    this._joinPromise = null;

    this._connection.on(ConvergenceConnection.Events.INTERRUPTED, this._setOffline);
    this._connection.on(ConvergenceConnection.Events.DISCONNECTED, this._setOffline);
    this._connection.on(ConvergenceConnection.Events.CONNECTED, this._setOnline);

    this._connectionMessageSubscription = this._connection
        .messages()
        .subscribe((event: MessageEvent) => {
          const message = event.message;
          if (message.activitySessionJoined &&
              getOrDefaultNumber(message.activitySessionJoined.resourceId) === this._resource) {
            this._onSessionJoined(message.activitySessionJoined);
          } else if (message.activitySessionLeft &&
              getOrDefaultNumber(message.activitySessionLeft.resourceId) === this._resource) {
            this._onSessionLeft(message.activitySessionLeft);
          } else if (message.activityStateUpdated &&
              getOrDefaultNumber(message.activityStateUpdated.resourceId) === this._resource) {
            this._onRemoteStateUpdated(message.activityStateUpdated);
          } else {
            // no-op
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
  public leave(): Promise<void> {
    if (this.isJoined()) {
      if (this._connection.isConnected()) {
        return this._connection
            .request({
              activityLeaveRequest: {resourceId: this._resource}
            })
            .then(() => {
              this._completeLeave()
              return;
            });
      } else {
        this._completeLeave();
        return Promise.resolve();
      }
    } else {
      return Promise.reject(new ConvergenceError(`The activity was not joined: ${this._id}`));
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
    return this._localParticipant.state;
  }

  /**
   * Sets a single key-delta pair within this Activity's local state.
   *
   * ```typescript
   * activity.setState("key1", "delta");
   * ```
   *
   * @param key
   *   The key of the delta to set.
   * @param value
   *   The delta to set for the supplied key.
   */
  public setState(key: string, value: any): void;

  /**
   * Sets multiple key-delta pairs within this Activity's local state. This
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
   *   A map containing the key-delta pairs to set.
   */
  public setState(state: StringMapLike): void;

  public setState(): void {
    if (this.isJoined()) {
      let state: Map<string, any>;
      if (arguments.length === 1) {
        state = StringMap.coerceToMap(arguments[0]);
      } else if (arguments.length === 2) {
        state = new Map();
        state.set(arguments[0], arguments[1]);
      }

      if (state.size > 0) {
        this._sendStateUpdate(state, false, []);

        const oldValues = new Map();
        const newState = this.state();
        state.forEach((value: string, key: any) => {
          oldValues.set(key, newState.get(key));
          newState.set(key, value);
        });

        this._mutateLocalParticipant((local) => local.clone({state: newState}));
        const session = this._connection.session();

        const deltaEvent = new ActivityStateDeltaEvent(
            this,
            session.user(),
            session.sessionId(),
            true,
            state,
            false,
            [],
            oldValues);
        this._emitEvent(deltaEvent);

        state.forEach((v, k) => {
          const oldValue = oldValues.get(k);
          const event =
              new ActivityStateSetEvent(this, session.user(), session.sessionId(), true, k, v, oldValue);
          this._emitEvent(event);
        });
      }
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
      if (TypeChecker.isString(keys)) {
        keys = [keys];
      }

      if (keys.length > 0) {
        this._sendStateUpdate(null, false, keys as string[]);

        const newState = this.state();
        const oldValues = new Map();
        keys.forEach(key => {
          oldValues.set(key, newState.get(key));
          newState.delete(key);
        });

        this._mutateLocalParticipant((local) => local.clone({state: newState}));

        const session = this._connection.session();

        const deltaEvent = new ActivityStateDeltaEvent(
            this,
            session.user(),
            session.sessionId(),
            true,
            new Map(),
            false,
            keys,
            oldValues);
        this._emitEvent(deltaEvent);

        keys.forEach(key => {
          const oldValue = oldValues.get(key);
          const event =
              new ActivityStateRemovedEvent(this, session.user(), session.sessionId(), true, key, oldValue);
          this._emitEvent(event);
        });
      }
    }
  }

  /**
   * Removes all local state from this [[Activity]].
   */
  public clearState(): void {
    if (this.isJoined()) {
      if (this._localParticipant.state.size > 0) {
        this._sendStateUpdate(new Map(), true, null);

        const oldValues = this.state();
        this._mutateLocalParticipant((local) => local.clone({state: new Map()}));

        const session = this._connection.session();

        const deltaEvent = new ActivityStateDeltaEvent(
            this,
            session.user(),
            session.sessionId(),
            true,
            new Map(),
            true,
            [],
            oldValues);
        this._emitEvent(deltaEvent);

        const clearedEvent = new ActivityStateClearedEvent(this, session.user(), session.sessionId(), true, oldValues);
        this._emitEvent(clearedEvent);
      }
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
   *
   * @returns
   *   An array of [[ActivityParticipant]] objects, one for each joined
   *   participant.
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
   * @hidden
   * @private
   */
  public _join(options?: IActivityJoinOptions): void {
    if (this._joinPromise === null) {
      options = options || {};
      const deferred = new Deferred<void>();
      const initialState: Map<string, any> = options.state ?
          StringMap.coerceToMap(options.state) :
          new Map<string, any>();

      if (this._connection.isConnected()) {
        this._joinWhileOnline(deferred, initialState);
      } else {
        this._joinWhileOffline(deferred, initialState);
      }

      this._joinPromise = deferred.promise();
    }
  }

  /**
   * @hidden
   * @private
   */
  public _whenJoined(): Promise<void> {
    return this._joinPromise;
  }

  /**
   * @hidden
   * @private
   */
  private _setOnline = () => {
    this._logger.debug(() => `Activity '${this._id}' is online`);
    const initialState = this._localParticipant.state;
    const deferred = new Deferred<void>();
    this._joinWhileOnline(deferred, initialState);
  }

  /**
   * @hidden
   * @private
   */
  private _setOffline = () => {
    this._logger.debug(() => `Activity '${this._id}' is offline`);

    // We will remove all participants in a single shot, but
    // emit events for the leaving of each participant.
    this._mutateParticipants((participants) => {
      for (const [sessionId, participant] of participants) {
        if (sessionId !== this._localParticipant.sessionId) {
          participants.delete(sessionId);
          const event = new ActivitySessionLeftEvent(this, participant.user, participant.sessionId, false);
          this._emitEvent(event);
        }
      }
    });
  }

  /**
   * @hidden
   * @internal
   */
  private _completeLeave(): void {
    this._joined = false;
    this._resource = null;
    const user = this._connection.session().user();
    const sessionId = this._connection.session().sessionId();
    const event = new ActivityLeftEvent(this, user, sessionId, true);
    this._emitEvent(event);
    this._connectionMessageSubscription.unsubscribe();
    this._completeEventStream();
  }

  /**
   * @hidden
   * @internal
   */
  private _onSessionJoined(joined: IActivitySessionJoinedMessage): void {
    const user = this._identityCache.getUserForSession(joined.sessionId);
    const state = mapObjectValues(getOrDefaultObject(joined.state), protoValueToJson);

    const participant: ActivityParticipant =
        new ActivityParticipant(this, user, joined.sessionId, false, StringMap.objectToMap(state));

    this._mutateParticipants((participants) => participants.set(participant.sessionId, participant));

    this._emitParticipantJoined(participant);
  }

  /**
   * @hidden
   * @internal
   */
  private _emitParticipantJoined(participant: ActivityParticipant): void {
    const event =
        new ActivitySessionJoinedEvent(this, participant.user, participant.sessionId, false, participant);
    this._emitEvent(event);
  }

  /**
   * @hidden
   * @internal
   */
  private _onSessionLeft(left: IActivitySessionLeftMessage): void {
    const participant = this._participants.getValue().get(left.sessionId);
    this._emitParticipantLeft(participant);
    this._mutateParticipants((participants) => participants.delete(participant.sessionId));
  }

  /**
   * @hidden
   * @internal
   */
  private _emitParticipantLeft(participant: ActivityParticipant): void {
    const event = new ActivitySessionLeftEvent(this, participant.user, participant.sessionId, participant.local);
    this._emitEvent(event);
  }

  /**
   * @hidden
   * @internal
   */
  private _onRemoteStateUpdated(updated: IActivityStateUpdatedMessage): void {
    const sessionId = getOrDefaultString(updated.sessionId);

    const set = StringMap.objectToMap(getOrDefaultObject(updated.set));
    const complete = getOrDefaultBoolean(updated.complete);
    const removedKeys = getOrDefaultArray(updated.removed);

    if (complete) {
      // We are replacing the entire state, so we will either clear it
      // or replace it.
      if (set.size === 0) {
        this._handleStateCleared(sessionId);
      } else {
        this._handleStateReplaced(sessionId, set);
      }
    } else {
      // This a partial state update so we will handle both removals
      // and updates of state.
      if (removedKeys.length > 0) {
        this._handleStateRemoved(sessionId, removedKeys);
      }

      if (set.size > 0) {
        this._handleStateSet(sessionId, set);
      }
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _handleStateSet(sessionId: string, stateSet: Map<string, any>): void {
    const user = this._identityCache.getUserForSession(sessionId);

    const mapped = new Map<string, any>();
    stateSet.forEach((protoValue: any, key: string) => {
      const value = protoValueToJson(protoValue);
      mapped.set(key, value);
    });

    const oldValues = new Map();
    this._mutateParticipants((participants) => {
      const existing = participants.get(sessionId);
      const state = new Map<string, any>(existing.state);
      mapped.forEach((value: any, key: string) => {
        oldValues.set(key, state.get(key));
        state.set(key, value);
      });
      participants.set(sessionId, existing.clone({state}));
    });

    const deltaEvent =
        new ActivityStateDeltaEvent(this, user, sessionId, true, mapped, false, [], oldValues);
    this._emitEvent(deltaEvent);

    mapped.forEach((v, k) => {
      const oldValue = oldValues.get(k);
      const event = new ActivityStateSetEvent(this, user, sessionId, false, k, v, oldValue);
      this._emitEvent(event);
    });
  }

  /**
   * @hidden
   * @internal
   */
  private _handleStateReplaced(sessionId: string, state: Map<string, any>): void {
    const user = this._identityCache.getUserForSession(sessionId);

    const newState = new Map<string, any>();
    Object.keys(state).forEach(key => {
      const value = protoValueToJson(state[key]);
      newState.set(key, value);
    });

    const oldValues = this._participants.getValue().get(sessionId).state;

    this._mutateParticipants((participants) => {
      const existing = participants.get(sessionId);
      participants.set(sessionId, existing.clone({state: newState}));
    });

    const removed: string[] = [];
    oldValues.forEach((value, key) => {
      if (!newState.has(key)) {
        removed.push(key);
      }
    });

    const deltaEvent =
        new ActivityStateDeltaEvent(this, user, sessionId, true, newState, false, removed, oldValues);
    this._emitEvent(deltaEvent);

    removed.forEach((key) => {
      const oldValue = oldValues.get(key);
      const event = new ActivityStateRemovedEvent(this, user, sessionId, false, key, oldValue);
      this._emitEvent(event);
    });

    newState.forEach((v, k) => {
      const oldValue = oldValues.get(k);
      const event = new ActivityStateSetEvent(this, user, sessionId, false, k, v, oldValue);
      this._emitEvent(event);
    });
  }

  /**
   * @hidden
   * @internal
   */
  private _handleStateCleared(sessionId: string): void {
    const user = this._identityCache.getUserForSession(sessionId);

    const oldValues = this._participants.getValue().get(sessionId).state;

    this._mutateParticipants((participants) => {
      const existing = participants.get(sessionId);
      const state = new Map<string, any>();
      participants.set(sessionId, existing.clone({state}));
    });

    const deltaEvent =
        new ActivityStateDeltaEvent(this, user, sessionId, true, new Map(), true, [], oldValues);
    this._emitEvent(deltaEvent);

    const event = new ActivityStateClearedEvent(this, user, sessionId, false, oldValues);
    this._emitEvent(event);
  }

  /**
   * @hidden
   * @internal
   */
  private _handleStateRemoved(sessionId: string, keys: string[]): void {
    const user = this._identityCache.getUserForSession(sessionId);

    const oldValues = new Map();
    this._mutateParticipants((participants) => {
      const existing = participants.get(sessionId);
      const state = new Map<string, any>(existing.state);
      keys.forEach((key: string) => {
        oldValues.set(key, state.get(key));
        state.delete(key);
      });
      participants.set(sessionId, existing.clone({state}));
    });

    const deltaEvent =
        new ActivityStateDeltaEvent(this, user, sessionId, true, new Map(), false, keys, oldValues);
    this._emitEvent(deltaEvent);

    keys.forEach((key) => {
      const oldValue = oldValues.get(key);
      const event = new ActivityStateRemovedEvent(this, user, sessionId, false, key, oldValue);
      this._emitEvent(event);
    });
  }

  /**
   * @hidden
   * @internal
   */
  private _mutateParticipants(mutator: (previous: Map<string, ActivityParticipant>) => void): void {
    const participants = new Map(this._participants.getValue());
    mutator(participants);
    this._participants.next(participants);
  }

  /**
   * @hidden
   * @internal
   */
  private _mutateLocalParticipant(mutator: (local: ActivityParticipant) => ActivityParticipant): void {
    this._mutateParticipants(participants => {
      this._localParticipant = mutator(this._localParticipant);
      participants.set(this._localParticipant.sessionId, this._localParticipant);
    });
  }

  /**
   * @hidden
   * @internal
   */
  private _joinWhileOnline(deferred: Deferred<void>, initialState: Map<string, any>): void {
    const mappedState = mapObjectValues(StringMap.mapToObject(initialState), jsonToProtoValue);
    const message: IConvergenceMessage = {
      activityJoinRequest: {
        activityId: this._id,
        state: mappedState
      }
    };

    this._resource = null;

    this._connection
        .request(message)
        .then((response: IConvergenceMessage) => {
          const joinResponse = response.activityJoinResponse;

          const localSessionId = this._connection.session().sessionId();
          this._resource = getOrDefaultNumber(joinResponse.resourceId);

          const participants: Map<string, ActivityParticipant> = new Map<string, ActivityParticipant>();
          const responseState = getOrDefaultObject(joinResponse.state);
          objectForEach(responseState, (sessionId) => {
            // We need to handle the case where the state for this session was
            // not in protobuf because it is an empty map.
            const activityState = responseState[sessionId] || {};
            const user = this._identityCache.getUserForSession(sessionId);
            const local: boolean = sessionId === localSessionId;
            const rawState = getOrDefaultObject(activityState.state);
            const jsonState = mapObjectValues(rawState, protoValueToJson);
            const stateMap: Map<string, any> = StringMap.objectToMap(jsonState);
            const participant = new ActivityParticipant(this, user, sessionId, local, stateMap);
            participants.set(sessionId, participant);
          });

          // If we had a previous state, then we will emit that that participant has left, but
          // we will merge its state into the new local participant and make sure we send any
          // outstanding state changes to the server.
          if (this._localParticipant !== undefined) {
            this._emitParticipantLeft(this._localParticipant);

            // The local participant as joined, may have out of date state.
            const joinedLocalParticipant = participants.get(localSessionId);

            const updatedJoinedLocalParticipant =
                joinedLocalParticipant.clone({state: this._localParticipant.state});
            this._syncStateAfterJoinOnline(joinedLocalParticipant.state, this._localParticipant.state);

            participants.set(localSessionId, updatedJoinedLocalParticipant);
          }

          this._localParticipant = participants.get(localSessionId);
          this._participants.next(participants);

          participants.forEach(p => this._emitParticipantJoined(p));

          deferred.resolve();
        })
        .catch(e => {
          // fixme maybe go offline?
          deferred.reject(e);
        });
  }

  /**
   * @hidden
   * @internal
   */
  private _syncStateAfterJoinOnline(serverState: Map<string, any>, localState: Map<string, any>): void {
    const removedKeys: string[] = [];
    serverState.forEach((value, key) => {
      if (!localState.has(key)) {
        removedKeys.push(key);
      }
    });

    const updated = new Map<string, any>();
    localState.forEach((value, key) => {
      if (!EqualsUtil.deepEquals(!serverState.get(key), value)) {
        updated.set(key, value);
      }
    });

    if (removedKeys.length > 0 || updated.size > 0) {
      this._sendStateUpdate(updated, false, removedKeys);
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _joinWhileOffline(deferred: Deferred<void>, initialState: Map<string, any>): void {
    this._joined = true;
    const session = this._connection.session();
    this._localParticipant =
        new ActivityParticipant(undefined, session.user(), session.sessionId(), true, initialState);

    const participants: Map<string, ActivityParticipant> = new Map<string, ActivityParticipant>();
    participants.set(this._localParticipant.sessionId, this._localParticipant);
    this._participants.next(participants);

    deferred.resolve();
  }

  /**
   * @hidden
   * @private
   */
  private _sendStateUpdate(state: Map<string, any> | null, complete: boolean, removedKeys: string[] | null): void {
    const set = state !== null ? mapObjectValues(StringMap.mapToObject(state), jsonToProtoValue) : {};
    const removed = removedKeys !== null ? removedKeys : [];

    if (this._connection.isConnected()) {
      const message: IConvergenceMessage = {
        activityUpdateState: {resourceId: this._resource, set, complete, removed}
      };
      this._connection.send(message);
    }
  }
}

Object.freeze(Activity.Events);
