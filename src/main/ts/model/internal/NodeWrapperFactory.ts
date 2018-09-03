import {ModelNode} from "./ModelNode";

/**
 * @hidden
 * @internal
 */
export abstract class NodeWrapperFactory<T> {

  private _wrappers: Map<string, T>;

  constructor() {
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
