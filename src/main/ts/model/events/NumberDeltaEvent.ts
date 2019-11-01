import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableNumber} from "../observable/ObservableNumber";
import {DomainUser} from "../../identity";

/**
 * Emitted when arithmetic is performed on a [[RealTimeNumber]].
 *
 * When the value of a [[RealTimeNumber]] is directly set
 * (with e.g. `rtNumber.value(23)`), a [[NumberSetValueEvent]] is emitted.
 *
 * @module RealTimeData
 */
export class NumberDeltaEvent implements IValueChangedEvent {
  public static readonly NAME = "delta";

  /**
   * @inheritdoc
   */
  public readonly name: string = NumberDeltaEvent.NAME;

  /**
   * @param element
   * @param value
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
    public readonly local: boolean,

    /**
     * The new value of the number
     */
    public readonly value: number
  ) {
    Object.freeze(this);
  }
}
