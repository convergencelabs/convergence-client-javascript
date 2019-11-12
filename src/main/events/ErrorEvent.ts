/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

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
