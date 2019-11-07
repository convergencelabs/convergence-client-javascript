import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

/**
 * Emitted when a [[ConvergenceDomain]] becomes disconnected AND is not attempting to reconnect.
 * Essentially, the domain has given up trying to connect and reverted to offline mode.
 *
 * @module Connection and Authentication
 */
export class DisconnectedEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "disconnected";

  /**
   * @inheritdoc
   */
  public readonly name: string = DisconnectedEvent.NAME;

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
