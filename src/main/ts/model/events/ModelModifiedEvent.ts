import {RealTimeModel} from "../rt";
import {IModelEvent} from "./IModelEvent";

/**
 * The [[ModelModifiedEvent]] is when a model has its first non-acknowledged
 * mutation. It is fired when the model currently has not outstanding changes
 * and a change is made. It will not be fired on subsequent consecutive
 * changes unless all changes are first acknowledged.
 *
 * @module RealTimeData
 */
export class ModelModifiedEvent implements IModelEvent {
  public static readonly NAME = "modified";

  /**
   * @inheritdoc
   */
  public readonly name: string = ModelModifiedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The model model that emitted the event.
     */
    public readonly src: RealTimeModel
  ) {
    Object.freeze(this);
  }
}
