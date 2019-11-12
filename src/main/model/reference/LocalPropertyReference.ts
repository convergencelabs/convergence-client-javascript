/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {ModelReferenceCallbacks, LocalModelReference} from "./LocalModelReference";
import {PropertyReference} from "./PropertyReference";

/**
 * An [[PropertyReference]] that was created locally.
 * See [[RealTimeObject.propertyReference]]
 *
 * @category Collaboration Awareness
 */
export class LocalPropertyReference extends LocalModelReference<string, PropertyReference> {

  /**
   * @param reference
   * @param referenceCallbacks
   *
   * @hidden
   * @internal
   */
  constructor(reference: PropertyReference, referenceCallbacks: ModelReferenceCallbacks) {
    super(reference, referenceCallbacks);
  }
}
