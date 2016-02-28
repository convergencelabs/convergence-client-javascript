import {LocalModelReference} from "./LocalModelReference";
import {IndexReference} from "./IndexReference";

export class LocalIndexReference extends LocalModelReference {

  constructor(reference: IndexReference,
              published: boolean) {
    super(reference, published);
  }

  set(index: number): void {
    (<IndexReference>this._reference)._set(index, true);
  }

  index(): number {
    return (<IndexReference>this._reference).index();
  }

  clear(): void {
    (<IndexReference>this._reference)._clear();
  }

  isSet(): boolean {
    return this._reference.isSet();
  }
}
