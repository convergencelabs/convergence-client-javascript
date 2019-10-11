import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";
import { AuthenticationMethod } from "../connection/AuthenticationMethod";

/**
 * Emitted when a [[ConvergenceDomain]] successfully (re)authenticates.
 *
 * @category Connection and Authentication
 */
export class AuthenticatedEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "authenticated";

  /**
   * @inheritdoc
   */
  public readonly name: string = AuthenticatedEvent.NAME;

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
     * The method of authentication that was successful.
     */
    public readonly method: AuthenticationMethod
  ) {
    Object.freeze(this);
  }
}
