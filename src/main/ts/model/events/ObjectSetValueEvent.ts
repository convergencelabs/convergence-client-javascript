import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableObject} from "../observable/ObservableObject";

export class ObjectSetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = ObjectSetValueEvent.NAME;

  /**
   * @param element
   * @param sessionId
   * @param username
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableObject,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}
