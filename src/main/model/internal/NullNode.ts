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
import {ModelElementType} from "../ModelElementType";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {Model} from "./Model";
import {Path} from "../Path";
import {NullValue, DataValueType} from "../dataValue";
import {ConvergenceSession} from "../../ConvergenceSession";

/**
 * @hidden
 * @internal
 */
export class NullNode extends ModelNode<void> {

  public static Events: any = {
    DETACHED: ModelNode.Events.DETACHED
  };

  /**
   * Constructs a new RealTimeNull.
   */
  constructor(id: string,
              path: () => Path,
              model: Model,
              session: ConvergenceSession) {
    super(ModelElementType.NULL, id, path, model, session);
  }

  public dataValue(): NullValue {
    return {
      id: this.id(),
      type: DataValueType.NULL,
      value: this.data()
    } as NullValue;
  }

  public toJson(): any {
    return null;
  }

  public _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    throw new Error("Null values do not process operations");
  }

  protected _getData(): any {
    return null;
  }

  protected _setData(data: any): void {
    throw new Error("Can not set the delta on a Null type.");
  }
}
