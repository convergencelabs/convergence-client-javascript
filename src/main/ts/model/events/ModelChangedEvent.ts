import {IConvergenceModelValueEvent} from "./IConvergenceModelValueEvent";
import {ObservableElement} from "../observable/ObservableElement";
import {Path} from "../Path";
import {IValueChangedEvent} from "./IValueChangedEvent";
import {DomainUser} from "../../identity";

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
   * @param user
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableElement<any>,
              public readonly user: DomainUser,
              public readonly sessionId: string,
              public readonly local: boolean,
              public readonly relativePath: Path,
              public readonly childEvent: IValueChangedEvent) {
    Object.freeze(this);
  }
}
