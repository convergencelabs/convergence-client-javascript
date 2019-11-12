/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IConvergenceEvent} from "../../util";
import {ObservableElement} from "../observable/ObservableElement";

/**
 * Emitted when an element becomes detached.  This typically happens when the element
 * is removed from its parent.
 *
 * @module Real Time Data
 */
export class ElementDetachedEvent implements IConvergenceEvent {
  public static readonly NAME = "detached";

  /**
   * @inheritdoc
   */
  public readonly name: string = ElementDetachedEvent.NAME;

  /**
   * @param src
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeElement]] or [[HistoricalElement]] that was detached.
     */
    public readonly src: ObservableElement<any>
  ) { }
}
