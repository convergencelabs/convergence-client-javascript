import {IValueChangedEvent} from "../index";
import {ObservableObject} from "../observable/ObservableObject";
import {ObservableElement} from "../observable/ObservableElement";

export class ObjectRemoveEvent implements IValueChangedEvent {
  public static readonly NAME = "remove";
  public readonly name: string = ObjectRemoveEvent.NAME;

  /**
   * @param element
   * @param key
   * @param oldValue
   * @param sessionId
   * @param username
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableObject,
              public readonly key: string,
              public readonly oldValue: ObservableElement<any>,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}
