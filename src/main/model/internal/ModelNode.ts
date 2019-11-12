/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {Model} from "./Model";
import {Path} from "../Path";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {
  NodeChangedEvent,
  NodeValueChangedEvent,
  NodeDetachedEvent,
  ModelNodeEvent
} from "./events";
import {DataValue} from "../dataValue";
import {ConvergenceEventEmitter} from "../../util";
import {ConvergenceSession} from "../../ConvergenceSession";

/**
 * @hidden
 * @internal
 */
export abstract class ModelNode<T> extends ConvergenceEventEmitter<ModelNodeEvent> {

  public static Events: any = {
    DETACHED: "detached",
    NODE_CHANGED: "node_changed",
    OPERATION: "operation"
  };

  protected _model: Model;
  protected _path: () => Path;
  protected readonly _session: ConvergenceSession;

  private readonly _id: string;
  private readonly _modelType: string;

  /**
   * Constructs a new RealTimeElement.
   */
  protected constructor(modelType: string,
                        id: string,
                        path: () => Path,
                        model: Model,
                        session: ConvergenceSession) {
    super();
    this._id = id;
    this._session = session;
    this._modelType = modelType;
    this._model = model;
    this._path = path;

    if (this._model) {
      this._model._registerValue(this);
    }
  }

  public session(): ConvergenceSession {
    return this._session;
  }

  public id(): string {
    return this._id;
  }

  public type(): string {
    return this._modelType;
  }

  public path(): Path {
    return this._path();
  }

  public model(): Model {
    return this._model;
  }

  public isDetached(): boolean {
    return this._model === null;
  }

  public _detach(local: boolean): void {
    this._model._unregisterValue(this);
    this._model = null;

    const event: NodeDetachedEvent = new NodeDetachedEvent(this, local);
    this._emitEvent(event);
  }

  public data(): T;
  public data(value: T): void;
  public data(value?: T): any {
    if (arguments.length === 0) {
      return this._getData();
    } else {
      this._setData(value);
      return;
    }
  }

  public abstract dataValue(): DataValue;

  public abstract toJson(): any;

  public abstract _handleModelOperationEvent(operationEvent: ModelOperationEvent): void;

  protected _emitValueEvent(event: NodeValueChangedEvent): void {
    this._emitEvent(event);
    this._emitEvent(
      new NodeChangedEvent(this, event.local, [], event, this._session.sessionId(), this._session.user()));
  }

  protected _exceptionIfDetached(): void {
    if (this.isDetached()) {
      throw Error("Can not perform actions on a detached ModelNode.");
    }
  }

  protected abstract _getData(): T;

  protected abstract _setData(value: T): void;
}
