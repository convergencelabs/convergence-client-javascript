import {RealTimeElement} from "./RealTimeElement";
import {NullNode} from "../internal/NullNode";
import {RealTimeModel, ModelEventCallbacks} from "./RealTimeModel";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ObservableNull, ObservableNullEvents, ObservableNullEventConstants} from "../observable/ObservableNull";
import {RemoteReferenceEvent} from "../reference/RemoteReferenceEvent";
import {IdentityCache} from "../../identity/IdentityCache";

/**
 * @module RealTimeData
 */
export interface RealTimeNullEvents extends ObservableNullEvents {
}

/**
 * This is a convenience object that wraps a javascript `null`. These are returned
 * when a [[RealTimeObject]] or [[RealTimeArray]] contains a null value. The `value()`
 * of this is always `null` and cannot be changed.
 *
 * See [[RealTimeNullEvents]] for the events that can be emitted on remote
 * changes to this object.
 *
 * More information is in the
 * [developer guide](https://docs.convergence.io/guide/models/data/real-time-null.html).
 *
 * @module RealTimeData
 */
export class RealTimeNull extends RealTimeElement<void> implements ObservableNull {

  public static readonly Events: RealTimeNullEvents = ObservableNullEventConstants;

  /**
   * Constructs a new RealTimeNull.
   *
   * @hidden
   * @internal
   */
  constructor(delegate: NullNode,
              callbacks: ModelEventCallbacks,
              wrapperFactory: RealTimeWrapperFactory,
              model: RealTimeModel,
              identityCache: IdentityCache) {
    super(delegate, callbacks, wrapperFactory, model, [], identityCache);
  }

  /**
   * @param event
   *
   * @private
   * @hidden
   * @internal
   */
  public handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Null values do not process references");
  }
}
