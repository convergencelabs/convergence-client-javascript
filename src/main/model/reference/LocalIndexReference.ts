/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {ModelReferenceCallbacks, LocalModelReference} from "./LocalModelReference";
import {IndexReference} from "./IndexReference";

/**
 * An [[IndexReference]] that was created locally. See [[RealTimeString.indexReference]]
 *
 * @category Collaboration Awareness
 */
export class LocalIndexReference extends LocalModelReference<number, IndexReference> {
  /**
   * @param reference
   * @param referenceCallbacks
   *
   * @hidden
   * @internal
   */
  constructor(reference: IndexReference, referenceCallbacks: ModelReferenceCallbacks) {
    super(reference, referenceCallbacks);
  }
}
