import {RealTimeElement} from "./RealTimeElement";
import {BooleanNode} from "../internal/BooleanNode";
import {BooleanSetOperation} from "../ot/ops/BooleanSetOperation";
import {RealTimeModel, ModelEventCallbacks} from "./RealTimeModel";
import {ModelNodeEvent, BooleanNodeSetValueEvent} from "../internal/events";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {
  ObservableBoolean,
  ObservableBooleanEvents,
  ObservableBooleanEventConstants
} from "../observable/ObservableBoolean";
import {RemoteReferenceEvent} from "../reference/RemoteReferenceEvent";
import {IdentityCache} from "../../identity/IdentityCache";

/**
 * An enumeration of the events that could be emitted by a [[RealTimeBoolean]].
 *
 * @module RealTimeData
 */
export interface RealTimeBooleanEvents extends ObservableBooleanEvents {
}

/**
 * A distributed boolean.  This wraps a native javascript `boolean` primitive.
 *
 * See [[RealTimeBooleanEvents]] for the events that can be emitted on remote
 * changes to this object.
 *
 * Common use cases are documented in the
 * [developer guide](https://docs.convergence.io/guide/models/data/real-time-boolean.html).
 *
 * @module RealTimeData
 */
export class RealTimeBoolean extends RealTimeElement<boolean> implements ObservableBoolean {

  /**
   * A mapping of the events this array could emit to each event's unique name.
   * Use this to refer an event name, e.g.
   *
   * ```typescript
   * rtBoolean.on(RealTimeBoolean.Events.VALUE, function listener(e) {
   *   // ...
   * })
   * ```
   */
  public static readonly Events: RealTimeBooleanEvents = ObservableBooleanEventConstants;

  /**
   * Constructs a new RealTimeBoolean.
   *
   * @hidden
   * @internal
   */
  constructor(delegate: BooleanNode,
              callbacks: ModelEventCallbacks,
              wrapperFactory: RealTimeWrapperFactory,
              model: RealTimeModel,
              identityCache: IdentityCache) {
    super(delegate, callbacks, wrapperFactory, model, [], identityCache);

    this._delegate.events().subscribe((event: ModelNodeEvent) => {
      if (event.local) {
        if (event instanceof BooleanNodeSetValueEvent) {
          this._sendOperation(new BooleanSetOperation(this.id(), false, event.value));
        }
      }
    });
  }

  /**
   * @param event
   *
   * @private
   * @hidden
   * @internal
   */
  public _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Boolean values do not process references");
  }
}
