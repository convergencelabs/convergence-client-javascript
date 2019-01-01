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
import {io} from "@convergence/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;

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
  constructor(_delegate: UndefinedNode,
              _callbacks: ModelEventCallbacks,
              _wrapperFactory: RealTimeWrapperFactory,
              _model: RealTimeModel) {
    super(_delegate, _callbacks, _wrapperFactory, _model, []);
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
  public _handleRemoteReferenceEvent(event: IConvergenceMessage): void {
    throw new Error("Undefined values do not process references");
  }

  /**
   * @param data
   * @private
   * @hidden
   * @internal
   */
  protected _setData(data: any): void {
    throw new Error("Can not set the value on a Undefined type.");
  }
}
