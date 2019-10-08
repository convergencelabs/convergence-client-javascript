import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

/**
 * Emitted when a [[ConvergenceDomain]] is actively attempting to (re)connect to
 * a server.
 */
export class ConnectingEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "connecting";

  /**
   * @inheritdoc
   */
  public readonly name: string = ConnectingEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * @inheritdoc
     */
    public readonly domain: ConvergenceDomain
  ) {
    Object.freeze(this);
  }
}
