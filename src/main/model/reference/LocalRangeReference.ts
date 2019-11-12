/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {ModelReferenceCallbacks, LocalModelReference} from "./LocalModelReference";
import {RangeReference, IndexRange} from "./RangeReference";

/**
 * A [[RangeReference]] that was created locally. See [[RealTimeString.rangeReference]]
 *
 * @module Collaboration Awareness
 */
export class LocalRangeReference extends LocalModelReference<IndexRange, RangeReference> {

  /**
   * @param reference
   * @param referenceCallbacks
   *
   * @hidden
   * @internal
   */
  constructor(reference: RangeReference, referenceCallbacks: ModelReferenceCallbacks) {
    super(reference, referenceCallbacks);
  }
}
