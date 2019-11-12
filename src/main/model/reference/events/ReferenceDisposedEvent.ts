/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IConvergenceEvent} from "../../../util";
import {ModelReference} from "../ModelReference";

/**
 * Emitted when a [[ModelReference]] is disposed.
 *
 * @category Collaboration Awareness
 */
export class ReferenceDisposedEvent implements IConvergenceEvent {
  public static readonly NAME = "disposed";

  /**
   * @inheritdoc
   */
  public readonly name: string = ReferenceDisposedEvent.NAME;

  constructor(
    /**
     * The underlying reference that was disposed.
     */
    public readonly src: ModelReference<any>
  ) {
    Object.freeze(this);
  }
}
