import {IModelEvent} from "./IModelEvent";
import {ObservableModel} from "../observable/ObservableModel";

export class VersionChangedEvent implements IModelEvent {
  public static readonly NAME = "version_changed";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = VersionChangedEvent.NAME;

  /**
   * @param src
   * @param version
   *
   * @hidden
   * @internal
   */
  constructor(
    public readonly src: ObservableModel,
    public readonly version: number
  ) {
    Object.freeze(this);
  }
}
