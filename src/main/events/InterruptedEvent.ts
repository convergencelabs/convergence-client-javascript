/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

/**
 * Emitted when a [[ConvergenceDomain]] becomes disconnected but is still
 * attempting to automatically reconnect.
 *
 * @category Connection and Authentication
 */
export class InterruptedEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "interrupted";

  /**
   * @inheritdoc
   */
  public readonly name: string = InterruptedEvent.NAME;

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
