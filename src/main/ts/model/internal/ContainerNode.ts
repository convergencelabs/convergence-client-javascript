import {ModelElementType} from "../ModelElementType";
import {PathElement} from "../ot/Path";
import {Model} from "./Model";
import {Path} from "../ot/Path";
import {ModelNode} from "./ModelNode";
import {NodeChangedEvent} from "./events";

export abstract class ContainerNode<T> extends ModelNode<T> {


  static Events: any = {
    NODE_CHANGED: ModelNode.Events.NODE_CHANGED
  };

  _idToPathElement: Map<string, PathElement>;

  protected _nodeChangedHandler: (event: NodeChangedEvent) => any = (event: NodeChangedEvent) => {
    const newPath: Path = event.relativePath.slice(0);
    newPath.unshift(this._idToPathElement.get(event.src.id()));

    const newEvent: NodeChangedEvent = new NodeChangedEvent(this, event.local, newPath, event.childEvent, this.sessionId, this.username);

    this._emitEvent(newEvent);
  };

  /**
   * Constructs a new RealTimeContainer.
   */
  constructor(modelType: ModelElementType,
              id: string,
              path: () => Path,
              model: Model,
              sessionId: string,
              username: string)  {
    super(modelType, id, path, model, sessionId, username);

    this._idToPathElement = new Map<string, PathElement>();
  }

  _detach(local: boolean): void {
    this._detachChildren(local);
    super._detach(local);
  }

  valueAt(pathArgs: any): ModelNode<any> {
    // We're letting them pass in individual path arguments or a single array of path arguments
    const pathArgsForReal: Path = <Path>(Array.isArray(pathArgs) ? pathArgs : arguments);
    if (pathArgsForReal.length === 0) {
      throw new Error("relative path of child must contain at least one element.");
    }
    return this._valueAt(pathArgsForReal);
  }

  abstract _valueAt(pathArgs: Path): ModelNode<any>;

  protected abstract _detachChildren(local: boolean): void;
}
