import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

/**
 * Emitted when a [[ConvergenceDomain]] either first connects to the server
 * or successfully reconnects.
 */
export class ConnectedEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "connected";

  /**
   * @inheritdoc
   */
  public readonly name: string = ConnectedEvent.NAME;

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
