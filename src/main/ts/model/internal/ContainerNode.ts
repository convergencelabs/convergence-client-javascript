import {ModelValueType} from "../ModelValueType";
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

  protected _nodeChangedHandler = (event: NodeChangedEvent) => {
    var newPath: Path = event.relativePath.slice(0);
    newPath.unshift(this._idToPathElement.get(event.src.id()));

    var newEvent: NodeChangedEvent = new NodeChangedEvent(this, event.local, newPath, event.childEvent, this.sessionId, this.username);

    this.emitEvent(newEvent);
  };

  /**
   * Constructs a new RealTimeContainer.
   */
  constructor(modelType: ModelValueType,
              id: string,
              path: () => Path,
              model: Model,
              sessionId: string,
              username: string)  {
    super(modelType, id, path, model, sessionId, username);

    this._idToPathElement = new Map<string, PathElement>();
  }

  _detach(): void {
    this._detachChildren();
    super._detach();
  }

  valueAt(pathArgs: any): ModelNode<any> {
    // We're letting them pass in individual path arguments or a single array of path arguments
    var pathArgsForReal: Path = Array.isArray(pathArgs) ? pathArgs : arguments;
    if (pathArgsForReal.length === 0) {
      throw new Error("relative path of child must contain at least one element.");
    }
    return this._valueAt(pathArgsForReal);
  }

  abstract _valueAt(pathArgs: Path): ModelNode<any>;

  protected abstract _detachChildren(): void;
}
