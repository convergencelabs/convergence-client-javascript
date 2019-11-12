/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {ModelOperationEvent} from "../ModelOperationEvent";
import {Path, PathElement} from "../Path";
import {ModelNode} from "./ModelNode";
import {DataValueFactory} from "../DataValueFactory";
import {ObjectNode} from "./ObjectNode";
import {ObjectValue} from "../dataValue";
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
              data: ObjectValue) {
    super();

    this._session = session;
    this._valueIdPrefix = valueIdPrefix;

    this._idToValue = new Map<string, ModelNode<any>>();
    this._vidCounter = 0;

    const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
      return this._valueIdPrefix + VALUE_SEPARATOR + this._vidCounter++;
    });

    this._data = new ObjectNode(data, () => {
      return [];
    }, this, session, dataValueFactory);
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
