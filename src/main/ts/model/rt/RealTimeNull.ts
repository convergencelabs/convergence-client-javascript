import {RealTimeElement} from "./RealTimeElement";
import {NullNode} from "../internal/NullNode";
import {RealTimeModel, ModelEventCallbacks} from "./RealTimeModel";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ObservableNull, ObservableNullEvents, ObservableNullEventConstants} from "../observable/ObservableNull";
import {RemoteReferenceEvent} from "../reference/RemoteReferenceEvent";
import {IdentityCache} from "../../identity/IdentityCache";

export interface RealTimeNullEvents extends ObservableNullEvents {
}

export class RealTimeNull extends RealTimeElement<void> implements ObservableNull {

  public static readonly Events: RealTimeNullEvents = ObservableNullEventConstants;

  /**
   * Constructs a new RealTimeNull.
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
