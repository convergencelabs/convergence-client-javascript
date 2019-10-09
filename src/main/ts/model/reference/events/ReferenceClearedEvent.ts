import {IConvergenceEvent} from "../../../util";
import {ModelReference} from "../ModelReference";

/**
 * Emitted when a [[ModelReference]]'s value is explicitly cleared.
 *
 * @category Collaboration Awareness
 */
export class ReferenceClearedEvent<T> implements IConvergenceEvent {
  public static readonly NAME = "cleared";

  /**
   * @inheritdoc
   */
  public readonly name: string = ReferenceClearedEvent.NAME;

  /**
   * The first previous value (if there were multiple) of the reference.
   */
  public readonly oldValue: T;

  constructor(
    /**
     * The underlying reference that was cleared.
     */
    public readonly src: ModelReference<any>,

    /**
     * The previous values of the reference.
     */
    public readonly oldValues: T[]
  ) {
    if (oldValues.length > 0) {
      this.oldValue = oldValues[0];
    }

    Object.freeze(this);
  }
}
