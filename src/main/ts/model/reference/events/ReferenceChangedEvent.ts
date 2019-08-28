import {IConvergenceEvent} from "../../../util";
import {ModelReference} from "../ModelReference";

/**
 * Emitted when a [[ModelReference]]'s value is set.
 */
export class ReferenceChangedEvent<T> implements IConvergenceEvent {
  public static readonly NAME = "set";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ReferenceChangedEvent.NAME;

  /**
   * The first (if there were multiple) previous value of the reference.
   */
  public readonly oldValue: T;

  constructor(
    /**
     * The underlying reference that changed.
     */
    public readonly src: ModelReference<any>,

    /**
     * The previous values of the reference.
     */
    public readonly oldValues: T[],

    /**
     * All newly-added values. That is, values that were not in the set of old values.
     */
    public readonly addedValues: T[],

    /**
     * All just-removed values.  That is, old values not in the set of new values.
     */
    public readonly removedValues: T[],

    /**
     * true if this event was emitted by the system, as opposed to an explicit e.g.
     * [[LocalModelReference.set]].
     */
    public readonly synthetic: boolean
  ) {
    if (oldValues.length > 0) {
      this.oldValue = oldValues[0];
    }

    Object.freeze(this);
  }
}
