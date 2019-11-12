/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {ModelReference} from "./ModelReference";
import {IndexTransformer} from "../ot/xform/reference/IndexTransformer";
import {RealTimeElement} from "../rt";
import {ReferenceManager} from "./ReferenceManager";
import {DomainUser} from "../../identity";

/**
 * Represents one or more indices in a [[RealTimeString]] that must be adjusted while
 * the data is changing.  See the
 * [developer guide](https://docs.convergence.io/guide/models/references/realtimestring.html)
 * for some examples.
 *
 * @module Collaboration Awareness
 */
export class IndexReference extends ModelReference<number> {

  /**
   * @param referenceManager
   * @param key
   * @param source
   * @param user
   * @param sessionId
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(referenceManager: ReferenceManager,
              key: string,
              source: RealTimeElement<any>,
              user: DomainUser,
              sessionId: string,
              local: boolean) {
    super(referenceManager, ModelReference.Types.INDEX, key, source, user, sessionId, local);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _handleInsert(index: number, length: number): void {
    this._setIfChanged(IndexTransformer.handleInsert(this._values, index, length), true);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _handleRemove(index: number, length: number): void {
    this._setIfChanged(IndexTransformer.handleRemove(this._values, index, length), true);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _handleReorder(fromIndex: number, toIndex: number): void {
    this._setIfChanged(IndexTransformer.handleReorder(this._values, fromIndex, toIndex), true);
  }
}
