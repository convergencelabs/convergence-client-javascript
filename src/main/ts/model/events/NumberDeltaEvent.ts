import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableNumber} from "../observable/ObservableNumber";
import {DomainUser} from "../../identity";

export class NumberDeltaEvent implements IValueChangedEvent {
  public static readonly NAME = "delta";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
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
    public readonly element: ObservableNumber,
    public readonly user: DomainUser,
    public readonly sessionId: string,
    public readonly local: boolean,
    public readonly value: number
  ) {
    Object.freeze(this);
  }
}
