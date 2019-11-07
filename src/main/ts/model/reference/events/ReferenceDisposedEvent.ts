import {IConvergenceEvent} from "../../../util";
import {ModelReference} from "../ModelReference";

/**
 * Emitted when a [[ModelReference]] is disposed.
 *
 * @module Collaboration Awareness
 */
export class ReferenceDisposedEvent implements IConvergenceEvent {
  public static readonly NAME = "disposed";

  /**
   * @inheritdoc
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
