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

export interface RealTimeBooleanEvents extends ObservableBooleanEvents {
}

export class RealTimeBoolean extends RealTimeElement<boolean> implements ObservableBoolean {

  public static readonly Events: RealTimeBooleanEvents = ObservableBooleanEventConstants;

  /**
   * Constructs a new RealTimeBoolean.
   *
   * @hidden
   * @private
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
