/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {HistoricalElement} from "./HistoricalElement";
import {BooleanNode} from "../internal/BooleanNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {
  ObservableBoolean,
  ObservableBooleanEvents,
  ObservableBooleanEventConstants
} from "../observable/ObservableBoolean";
import {HistoricalModel} from "./HistoricalModel";

/**
 * @category Real Time Data Subsystem
 */
export interface HistoricalBooleanEvents extends ObservableBooleanEvents {
}

/**
 * A read-only history-aware version of a [[RealTimeBoolean]].  See [[HistoricalElement]]
 * and [[HistoricalModel]] for some common usages.
 *
 * @category Real Time Data Subsystem
 */
export class HistoricalBoolean extends HistoricalElement<boolean> implements ObservableBoolean {

  public static readonly Events: HistoricalBooleanEvents = ObservableBooleanEventConstants;

  /**
   * @hidden
   * @internal
   */
  constructor(delegate: BooleanNode, wrapperFactory: HistoricalWrapperFactory, model: HistoricalModel) {
    super(delegate, wrapperFactory, model);
  }
}
