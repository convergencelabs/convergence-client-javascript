/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {ModelNode} from "./ModelNode";

/**
 * @hidden
 * @internal
 */
export abstract class NodeWrapperFactory<T> {

  private _wrappers: Map<string, T>;

  protected constructor() {
    this._wrappers = new Map<string, T>();
  }

  public wrap(node: ModelNode<any>): T {
    let wrapper: T = this._wrappers.get(node.id());
    if (wrapper === undefined) {
      wrapper = this._createWrapper(node);
      this._wrappers.set(node.id(), wrapper);
      node.on(ModelNode.Events.DETACHED, () => {
        this._wrappers.delete(node.id());
      });
    }
    return wrapper;
  }

  protected abstract _createWrapper(model: ModelNode<any>): T;
}
