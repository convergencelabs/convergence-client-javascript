import {IConvergenceEvent} from "../../util";
import {ObservableElement} from "../observable/ObservableElement";

export class ElementDetachedEvent implements IConvergenceEvent {
  public static readonly NAME = "detached";
  public readonly name: string = ElementDetachedEvent.NAME;

  /**
   * @param src
   *
   * @hidden
   * @internal
   */
  constructor(public readonly src: ObservableElement<any>) {
  }
}
