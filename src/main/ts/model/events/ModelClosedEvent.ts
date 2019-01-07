import {IModelEvent} from "./IModelEvent";
import {ObservableModel} from "../observable/ObservableModel";

/**
 * The [[ModelClosedEvent]] is fired when a Model is closed either by the
 * client or the server.
 */
export class ModelClosedEvent implements IModelEvent {
  public static readonly NAME = "closed";
  public readonly name: string = ModelClosedEvent.NAME;

  /**
   * @param src
   * @param local
   * @param reason
   *
   * @hidden
   * @internal
   */
  constructor(public readonly src: ObservableModel,
              public readonly local: boolean,
              public readonly reason?: string) {
    Object.freeze(this);
  }
}
