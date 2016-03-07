import {ModelReference} from "./ModelReference";

export interface ModelReferenceCallbacks {
  onPublish: (reference: LocalModelReference<any>) => void;
  onUnpublish: (reference: LocalModelReference<any>) => void;
  onSet: (reference: LocalModelReference<any>) => void;
  onClear: (reference: LocalModelReference<any>) => void;
}

export abstract class LocalModelReference<R extends ModelReference> {

  private _published: boolean;
  private _callbacks: ModelReferenceCallbacks;
  protected _reference: R;

  constructor(reference: R, callbacks: ModelReferenceCallbacks) {
    this._reference = reference;
    this._published = false;
    this._callbacks = callbacks;
  }

  reference(): R {
    return this._reference;
  }

  publish(): void {
    this._ensureAttached();
    this._published = true;
    this._callbacks.onPublish(this);
    if (this.reference().isSet()) {
      this._fireSet();
    }
  }

  unpublish(): void {
    this._ensureAttached();
    this._published = false;
    this._callbacks.onUnpublish(this);
  }

  isPublished(): boolean {
    return this._published;
  }

  clear(): void {
    this._ensureAttached();
    this._reference._clear();
    this._callbacks.onClear(this);
  }

  dispose(): void {
    this._ensureAttached();
    this.unpublish();
    // fixme
  }

  private _ensureAttached(): void {
    if (this.reference().source().isDetached()) {
      throw new Error("The source model is deteched");
    }
  }

  abstract set(value: any): void;

  protected _fireSet(): void {
    this._ensureAttached();
    if (this.isPublished()) {
      this._callbacks.onSet(this);
    }
  }
}
