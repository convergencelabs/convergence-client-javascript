import {IModelEvent} from "./IModelEvent";
import {ObservableModel} from "../observable/ObservableModel";

export class VersionChangedEvent implements IModelEvent {
  public static readonly NAME = "version_changed";
  public readonly name: string = VersionChangedEvent.NAME;

  /**
   * @param src
   * @param version
   *
   * @hidden
   * @internal
   */
  constructor(public readonly src: ObservableModel,
              public readonly version: number) {
    Object.freeze(this);
  }
}
