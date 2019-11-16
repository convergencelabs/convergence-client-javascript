/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {RealTimeElement} from "../rt/RealTimeElement";
import {RealTimeModel} from "../rt/RealTimeModel";

import {ModelReference} from "./ModelReference";
import {ElementDetachedEvent} from "../events/ElementDetachedEvent";
import {ReferenceManager} from "./ReferenceManager";
import {DomainUser} from "../../identity";

/**
 * Represents one or more elements in a [[RealTimeModel]] that must be adjusted
 * while the data is changing. See an example in the
 * [developer guide](https://docs.convergence.io/guide/models/references/realtimemodel.html).
 *
 * @module Collaboration Awareness
 */
export class ElementReference extends ModelReference<RealTimeElement<any>> {

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
              source: RealTimeModel,
              user: DomainUser,
              sessionId: string,
              local: boolean) {
    super(referenceManager, ModelReference.Types.ELEMENT, key, source, user, sessionId, local);
  }

  /**
   * @param values
   * @private
   * @hidden
   * @internal
   */
  public _set(values: Array<RealTimeElement<any>>, synthetic: boolean): void {
    for (const oldElement of this.values()) {
      oldElement.removeListener(RealTimeElement.Events.DETACHED, this._detachedListener);
    }

    // Add Detached Listeners
    for (const newElement of values) {
      newElement.addListener(RealTimeElement.Events.DETACHED, this._detachedListener);
    }
    super._set(values, synthetic);
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _clear(): void {
    for (const oldElement of this.values()) {
      oldElement.removeListener(RealTimeElement.Events.DETACHED, this._detachedListener);
    }
    super._clear();
  }

  /**
   * @param element
   * @private
   * @hidden
   * @internal
   */
  public _handleElementRemoved(element: RealTimeElement<any>): void {
    const index: number = this._values.indexOf(element, 0);
    if (index > -1) {
      const newElements: Array<RealTimeElement<any>> = this._values.slice(0);
      newElements.splice(index, 1);
      this._set(newElements, true);
    }
  }

  /**
   * @param event
   * @internal
   */
  private _detachedListener: (event: ElementDetachedEvent) => void = (event: ElementDetachedEvent) => {
    this._handleElementRemoved(event.src as RealTimeElement<any>);
  }
}
