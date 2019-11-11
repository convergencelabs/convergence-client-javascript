import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

/**
 * Emitted when a [[ConvergenceDomain]] encounters an unexpected error.
 */
export class ErrorEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "error";

  /**
   * @inheritdoc
   */
  public readonly name: string = ErrorEvent.NAME;

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
     * A message describing the error.
     */
    public readonly error: string
  ) {
    Object.freeze(this);
  }
}
