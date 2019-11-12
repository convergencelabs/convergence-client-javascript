/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {Path, PathElement} from "../Path";
import {Model} from "./Model";
import {ModelNode} from "./ModelNode";
import {NodeChangedEvent} from "./events";
import {UndefinedNode} from "./UndefinedNode";
import {ModelNodeFactory} from "./ModelNodeFactory";
import {ConvergenceSession} from "../../ConvergenceSession";

/**
 * @hidden
 * @internal
 */
export abstract class ContainerNode<T> extends ModelNode<T> {

  public static Events: any = {
    NODE_CHANGED: ModelNode.Events.NODE_CHANGED
  };

  protected _idToPathElement: Map<string, PathElement>;

  /**
   * Constructs a new RealTimeContainer.
   */
  protected constructor(modelType: string,
                        id: string,
                        path: () => Path,
                        model: Model,
                        session: ConvergenceSession) {
    super(modelType, id, path, model, session);

    this._idToPathElement = new Map<string, PathElement>();
  }

  public valueAt(path: Path): ModelNode<any>;
  public valueAt(...elements: PathElement[]): ModelNode<any>;
  public valueAt(...path: any[]): ModelNode<any> {
    const resolved: Path = (path.length === 1 && Array.isArray(path[0])) ?
      path[0] as Path :
      path as Path;

    if (path.length === 0) {
      return this;
    }

    return this._valueAt(resolved);
  }

  public _detach(local: boolean): void {
    this._detachChildren(local);
    super._detach(local);
  }

  protected abstract _detachChildren(local: boolean): void;

  protected abstract _valueAt(pathArgs: Path): ModelNode<any>;

  protected _nodeChangedHandler: (event: NodeChangedEvent) => any = (event: NodeChangedEvent) => {
    const newPath: Path = event.relativePath.slice(0);
    newPath.unshift(this._idToPathElement.get(event.src.id()));

    const newEvent: NodeChangedEvent = new NodeChangedEvent(
      this, event.local, newPath, event.childEvent, this._session.sessionId(), this._session.user());

    this._emitEvent(newEvent);
  }

  protected _createUndefinedNode(): UndefinedNode {
    return ModelNodeFactory.create(
      undefined,
      () => null,
      undefined,
      this._session) as UndefinedNode;
  }
}
