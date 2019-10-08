import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableArray} from "../observable/ObservableArray";
import {DomainUser} from "../../identity";

/**
 * Emitted when an element is reordered from a [[RealTimeArray]].
 *
 * The value that was moved can be found at [[toIndex]].
 */
export class ArrayReorderEvent implements IValueChangedEvent {
  public static readonly NAME = "reorder";

  /**
   * @inheritdoc
   */
  public readonly name: string = ArrayReorderEvent.NAME;

  /**
   * @param element
   * @param fromIndex
   * @param toIndex
   * @param sessionId
   * @param user
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeArray]] or [[HistoricalArray]] which was modified
     */
    public readonly element: ObservableArray,

    /**
     * @inheritdoc
     */
    public readonly user: DomainUser,

    /**
     * @inheritdoc
     */
    public readonly sessionId: string,

    /**
     * True if the change occurred locally (within the current session)
     */
    public readonly local: boolean,

    /**
     * The prior index of the moved element
     */
    public readonly fromIndex: number,

    /**
     * The new index of the element, whose value can be accessed by `element.get(toIndex)`
     */
    public readonly toIndex: number
  ) {
    Object.freeze(this);
  }
}
