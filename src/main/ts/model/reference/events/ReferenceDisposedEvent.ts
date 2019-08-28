import {IConvergenceEvent} from "../../../util";
import {ModelReference} from "../ModelReference";

/**
 * Emitted when a [[ModelReference]] is disposed.
 */
export class ReferenceDisposedEvent implements IConvergenceEvent {
  public static readonly NAME = "disposed";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ReferenceDisposedEvent.NAME;

  constructor(
    /**
     * The underlying reference that was disposed.
     */
    public readonly src: ModelReference<any>
  ) {
    Object.freeze(this);
  }
}
