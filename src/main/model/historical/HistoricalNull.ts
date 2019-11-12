/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {HistoricalElement} from "./HistoricalElement";
import {NullNode} from "../internal/NullNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {
  ObservableNull,
  ObservableNullEvents,
  ObservableNullEventConstants
} from "../observable/ObservableNull";
import {HistoricalModel} from "./HistoricalModel";

/**
 * @category Real Time Data Subsystem
 */
export interface HistoricalNullEvents extends ObservableNullEvents {
}

/**
 * A read-only history-aware version of a [[RealTimeNull]].  See [[HistoricalElement]]
 * and [[HistoricalModel]] for some common usages.
 *
 * @category Real Time Data Subsystem
 */
export class HistoricalNull extends HistoricalElement<void> implements ObservableNull {
  public static readonly Events: HistoricalNullEvents = ObservableNullEventConstants;

  /**
   * @hidden
   * @internal
   */
  constructor(delegate: NullNode, wrapperFactory: HistoricalWrapperFactory, model: HistoricalModel) {
    super(delegate, wrapperFactory, model);
  }
}
