import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";
import { AuthenticationMethod } from "../connection/AuthenticationMethod";

/**
 * Emitted when a [[ConvergenceDomain]] attempted to (re)authenticate
 * but failed.
 *
 * @module Connection and Authentication
 */
export class AuthenticationFailedEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "authentication_failed";

  /**
   * @inheritdoc
   */
  public readonly name: string = AuthenticationFailedEvent.NAME;

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
     * The type of authentication that failed.
     */
    public readonly method: AuthenticationMethod
  ) {
    Object.freeze(this);
  }
}
