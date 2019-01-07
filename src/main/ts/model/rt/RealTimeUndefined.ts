import {RealTimeElement} from "./RealTimeElement";
import {UndefinedNode} from "../internal/UndefinedNode";
import {RealTimeModel, ModelEventCallbacks} from "./RealTimeModel";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {
  ObservableUndefined,
  ObservableUndefinedEvents,
  ObservableUndefinedEventConstants
} from "../observable/ObservableUndefined";
import {Path, PathElement} from "../Path";
import {RealTimeContainerElement} from "./RealTimeContainerElement";
import {RemoteReferenceEvent} from "../reference/RemoteReferenceEvent";
import {IdentityCache} from "../../identity/IdentityCache";

export interface RealTimeUndefinedEvents extends ObservableUndefinedEvents {
}

export class RealTimeUndefined extends RealTimeElement<void> implements ObservableUndefined {

  public static readonly Events: RealTimeUndefinedEvents = ObservableUndefinedEventConstants;

  /**
   * Constructs a new RealTimeUndefined.
   *
   * @hidden
   * @internal
   */
  constructor(delegate: UndefinedNode,
              callbacks: ModelEventCallbacks,
              wrapperFactory: RealTimeWrapperFactory,
              model: RealTimeModel,
              identityCache: IdentityCache) {
    super(delegate, callbacks, wrapperFactory, model, [], identityCache);
  }

  public path(): Path {
    return null;
  }

  public relativePath(): PathElement {
    return null;
  }

  public parent(): RealTimeContainerElement<any> {
    return null;
  }

  public removeFromParent(): void {
    // no-op
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Undefined values do not process references");
  }

  /**
   * @param data
   * @private
   * @hidden
   * @internal
   */
  protected setData(data: any): void {
    throw new Error("Can not set the delta on a Undefined type.");
  }
}
