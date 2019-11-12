/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

/**
 * Emitted when a [[ConvergenceDomain]] either first connects to the server
 * or successfully reconnects.
 *
 * @category Connection and Authentication
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
