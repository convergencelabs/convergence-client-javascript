import {RealTimeElement} from "./RealTimeElement";
import {BooleanNode} from "../internal/BooleanNode";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {BooleanSetOperation} from "../ot/ops/BooleanSetOperation";
import {ModelEventCallbacks} from "./RealTimeModel";
import {BooleanNodeSetValueEvent} from "../internal/events";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ModelNodeEvent} from "../internal/events";
import {RealTimeModel} from "./RealTimeModel";
import {ObservableBoolean} from "../element/ObservableBoolean";

export class RealTimeBoolean extends RealTimeElement<boolean> implements ObservableBoolean {

  public static Events: any = {
    VALUE: "value",
    DETACHED: RealTimeElement.Events.DETACHED,
    MODEL_CHANGED: RealTimeElement.Events.MODEL_CHANGED
  };

  /**
   * Constructs a new RealTimeBoolean.
   */
  constructor(_delegate: BooleanNode,
              _callbacks: ModelEventCallbacks,
              _wrapperFactory: RealTimeWrapperFactory,
              _model: RealTimeModel) {
    super(_delegate, _callbacks, _wrapperFactory, _model, []);

    this._delegate.events().subscribe((event: ModelNodeEvent) => {
      if (event.local) {
        if (event instanceof BooleanNodeSetValueEvent) {
          this._sendOperation(new BooleanSetOperation(this.id(), false, event.value));
        }
      }
    });
  }

  public _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Boolean values do not process references");
  }
}
