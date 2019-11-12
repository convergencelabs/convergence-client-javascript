/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
