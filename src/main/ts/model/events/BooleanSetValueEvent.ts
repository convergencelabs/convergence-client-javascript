import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableBoolean} from "../observable/ObservableBoolean";
import {DomainUser} from "../../identity";

/**
 * Emitted when the [[RealTimeBoolean.value]] of a [[RealTimeBoolean]] is set.
 *
 * @module RealTimeData
 */
export class BooleanSetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";

  /**
   * @inheritdoc
   */
  public readonly name: string = BooleanSetValueEvent.NAME;

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
     * The [[RealTimeBoolean]] or [[HistoricalBoolean]] which was modified
     */
    public readonly element: ObservableBoolean,

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
