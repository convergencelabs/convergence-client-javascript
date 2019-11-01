import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableString} from "../observable/ObservableString";
import {DomainUser} from "../../identity";

/**
 * Emitted when the [[RealTimeString.value]] of a [[RealTimeString]] is set.
 *
 * @module RealTimeData
 */
export class StringSetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";

  /**
   * @inheritdoc
   */
  public readonly name: string = StringSetValueEvent.NAME;

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
     * The [[RealTimeString]] or [[HistoricalString]] which was modified
     */
    public readonly element: ObservableString,

    /**
     * @inheritdoc
     */
    public readonly user: DomainUser,

    /**
     * @inheritdoc
     */
    public readonly sessionId: string,

    /**
     * True if this change occurred locally (in the current session)
     */
    public readonly local: boolean
  ) {
    Object.freeze(this);
  }
}
