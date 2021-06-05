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

import {ModelOperationEvent} from "../ModelOperationEvent";
import {Path, PathElement} from "../Path";
import {ModelNode} from "./ModelNode";
import {DataValueFactory} from "../DataValueFactory";
import {ObjectNode} from "./ObjectNode";
import {IObjectValue} from "../dataValue";
import {IConvergenceEvent, ConvergenceEventEmitter} from "../../util";
import {ConvergenceSession} from "../../ConvergenceSession";

const VALUE_SEPARATOR: string = ":";

/**
 * @hidden
 * @internal
 */
export class Model extends ConvergenceEventEmitter<IConvergenceEvent> {

  public static Events: any = {
    DELETED: "deleted",
    MODIFIED: "modified"
  };

  private readonly _data: ObjectNode;
  private _idToValue: Map<string, ModelNode<any>>;

  private _vidCounter: number;

  private _session: ConvergenceSession;
  private _valueIdPrefix: string;

  /**
   * Constructs a new RealTimeModel.
   */
  constructor(session: ConvergenceSession,
              valueIdPrefix: string,
              data: IObjectValue,
              undefinedObjectValues: "error" | "omit",
              undefinedArrayValues: "error" | "null"
              ) {
    super();

    this._session = session;
    this._valueIdPrefix = valueIdPrefix;

    this._idToValue = new Map<string, ModelNode<any>>();
    this._vidCounter = 0;

    const idGenerator = () => this._valueIdPrefix + VALUE_SEPARATOR + this._vidCounter++;
    const dataValueFactory: DataValueFactory = new DataValueFactory(
        idGenerator,
        undefinedObjectValues,
        undefinedArrayValues);

    this._data = new ObjectNode(data, () => [], this, session, dataValueFactory);
  }

  public root(): ObjectNode {
    return this._data;
  }

  public valueAt(path: Path): ModelNode<any>;
  public valueAt(...elements: PathElement[]): ModelNode<any>;
  public valueAt(...path: any[]): ModelNode<any> {
    return this._data.valueAt(...path);
  }

  public setValueIdPrefix(prefix: string): void {
    this._valueIdPrefix = prefix;
  }

  //
  // Private API
  //

  public _getRegisteredValue(id: string): ModelNode<any> {
    return this._idToValue.get(id);
  }

  public _registerValue(value: ModelNode<any>): void {
    this._idToValue.set(value.id(), value);
  }

  public _unregisterValue(value: ModelNode<any>): void {
    this._idToValue.delete(value.id());
  }

  public handleModelOperationEvent(modelEvent: ModelOperationEvent): void {
    const child: ModelNode<any> = this._idToValue.get(modelEvent.operation.id);
    if (child) {
      child._handleModelOperationEvent(modelEvent);
    }
  }

  public valueIdPrefix(): string {
    return this._valueIdPrefix;
  }
}

Object.freeze(Model.Events);

/**
 * @hidden
 * @internal
 */
export enum ModelForcedCloseReasonCodes {
  UNKNOWN = 0,
  UNAUTHORIZED = 1,
  DELETED = 2,
  ERROR_APPLYING_OPERATION = 3,
  INVALID_REFERENCE_EVENT = 4,
  PERMISSION_ERROR = 5,
  UNEXPECTED_COMMITTED_VERSION = 6
}
