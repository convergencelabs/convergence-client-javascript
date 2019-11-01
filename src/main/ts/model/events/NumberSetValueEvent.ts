import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableNumber} from "../observable/ObservableNumber";
import {DomainUser} from "../../identity";

/**
 * Emitted when the [[RealTimeNumber.value]] of a [[RealTimeNumber]] is set.
 *
 * @module RealTimeData
 */
export class NumberSetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";

  /**
   * @inheritdoc
   */
  public readonly name: string = NumberSetValueEvent.NAME;

  /**
   * @param element
   * @param sessionId
   * @param user
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeNumber]] or [[HistoricalNumber]] which was modified
     */
    public readonly element: ObservableNumber,

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
    public readonly local: boolean
  ) {
    Object.freeze(this);
  }
}
