import {ModelNode} from "./ModelNode";

export abstract class NodeWrapperFactory<T> {

  private _wrappers: Map<string, T>;

  constructor() {
    this._wrappers = new Map<string, T>();
  }

  public wrap(node: ModelNode<any>): T {
    let wrapper: T = this._wrappers[node.id()];
    if (typeof wrapper === "undefined") {
      wrapper = this._createWrapper(node);
      this._wrappers[node.id()] = wrapper;
      node.on(ModelNode.Events.DETACHED, () => {
        this._wrappers.delete(node.id());
      });
    }
    return wrapper;
  }

  protected abstract _createWrapper(model: ModelNode<any>): T;
}
