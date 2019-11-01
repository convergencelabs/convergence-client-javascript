import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

/**
 * Emitted when a [[ConvergenceDomain]]'s (re)connection attempt fails.
 *
 * @module ConnectionAndAuthentication
 */
export class ConnectionFailedEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "connection_failed";

  /**
   * @inheritdoc
   */
  public readonly name: string = ConnectionFailedEvent.NAME;

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
