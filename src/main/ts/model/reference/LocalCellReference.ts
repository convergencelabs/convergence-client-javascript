import {LocalModelReference} from "./LocalModelReference";
import {ModelReferenceCallbacks} from "./LocalModelReference";
import {ReferenceDisposedCallback} from "./LocalModelReference";
import {CellRange} from "./CellReference";
import {CellReference} from "./CellReference";

export class LocalCellReference extends LocalModelReference<CellRange, CellReference> {
  constructor(reference: CellReference, referenceCallbacks: ModelReferenceCallbacks, disposeCallback: ReferenceDisposedCallback) {
    super(reference, referenceCallbacks, disposeCallback);
  }
}
