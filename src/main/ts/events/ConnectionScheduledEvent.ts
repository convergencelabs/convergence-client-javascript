import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

/**
 * Emitted when a [[ConvergenceDomain]] is scheduled to attempt to reconnect
 * to the server.
 *
 * @category Connection and Authentication
 */
export class ConnectionScheduledEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "connection_scheduled";

  /**
   * @inheritdoc
   */
  public readonly name: string = ConnectionScheduledEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * @inheritdoc
     */
    public readonly domain: ConvergenceDomain,

    /**
     * The number of seconds until the reconnection is attempted.
     */
    public readonly delay: number
  ) {
    Object.freeze(this);
  }
}
