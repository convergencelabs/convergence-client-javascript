import {ModelReference} from "./ModelReference";
import {RealTimeValue} from "../RealTimeValue";
import {DelegatingEventEmitter} from "../../util/DelegatingEventEmitter";

export interface ModelReferenceCallbacks {
  onPublish: (reference: LocalModelReference<any, any>) => void;
  onUnpublish: (reference: LocalModelReference<any, any>) => void;
  onSet: (reference: LocalModelReference<any, any>) => void;
  onClear: (reference: LocalModelReference<any, any>) => void;
}

export abstract class LocalModelReference<V, R extends ModelReference<V>> extends DelegatingEventEmitter {

  private _published: boolean;
  private _callbacks: ModelReferenceCallbacks;
  protected _reference: R;

  constructor(reference: R, callbacks: ModelReferenceCallbacks) {
    super(reference);
    this._reference = reference;
    this._published = false;
    this._callbacks = callbacks;
  }

  type(): string {
    return this._reference.type();
  }

  key(): string {
    return this._reference.key();
  }

  source(): RealTimeValue<any> {
    return this._reference.source();
  }

  isLocal(): boolean {
    return true;
  }

  userId(): string {
    return this._reference.userId();
  }

  sessionId(): string {
    return this._reference.sessionId();
  }

  isDisposed(): boolean {
    return this._reference.isDisposed();
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

  set(value: V): void {
    this._reference._set(value, true);
    this._fireSet();
  }

  protected _fireSet(): void {
    this._ensureAttached();
    if (this.isPublished()) {
      this._callbacks.onSet(this);
    }
  }

  private _ensureAttached(): void {
    if (this.reference().source().isDetached()) {
      throw new Error("The source model is detached");
    }
  }
}
