/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {LocalModelReference, ModelReferenceCallbacks} from "./LocalModelReference";
import {ElementReference} from "./ElementReference";
import {RealTimeElement} from "../rt";

/**
 * An [[ElementReference]] that was created locally. See [[RealTimeModel.elementReference]]
 *
 * @category Collaboration Awareness
 */
export class LocalElementReference extends LocalModelReference<RealTimeElement<any>, ElementReference> {
  /**
   * @param reference
   * @param referenceCallbacks
   *
   * @hidden
   * @internal
   */
  constructor(reference: ElementReference, referenceCallbacks: ModelReferenceCallbacks) {
    super(reference, referenceCallbacks);
  }
}
