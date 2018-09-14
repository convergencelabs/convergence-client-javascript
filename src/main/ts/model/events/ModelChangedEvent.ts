import {IConvergenceModelValueEvent} from "./IConvergenceModelValueEvent";
import {ObservableElement} from "../observable/ObservableElement";
import {Path} from "../Path";
import {IValueChangedEvent} from "./IValueChangedEvent";

/**
 * The [[ModelChangedEvent]] is fired by a [[ObservableElement]] when a child
 * element has a change.
 */
export class ModelChangedEvent implements IConvergenceModelValueEvent {
  public static readonly NAME = "model_changed";
  public readonly name: string = ModelChangedEvent.NAME;

  /**
   * @param element
   * @param relativePath
   * @param childEvent
   * @param sessionId
   * @param username
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableElement<any>,
              public readonly relativePath: Path,
              public readonly childEvent: IValueChangedEvent,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}
