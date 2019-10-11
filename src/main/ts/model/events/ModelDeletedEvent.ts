import {IModelEvent} from "./IModelEvent";
import {RealTimeModel} from "../rt";

/**
 * Emitted when a [[RealTimeModel]] has been deleted.
 *
 * @category Real Time Data Subsystem
 */
export class ModelDeletedEvent implements IModelEvent {
  public static readonly NAME = "deleted";

  /**
   * @inheritdoc
   */
  public readonly name: string = ModelDeletedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeModel]] that was deleted.
     */
    public readonly src: RealTimeModel,

    /**
     * True if this change occurred locally (in the current session)
     */
    public readonly local: boolean,

    /**
     * In the event that the model was deleted remotely, a reason may be provided.
     */
    public readonly reason?: string
  ) {
    Object.freeze(this);
  }
}
