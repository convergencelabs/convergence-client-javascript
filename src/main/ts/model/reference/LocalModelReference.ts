import {ModelReference} from "./ModelReference";
import {RealTimeElement} from "../rt/RealTimeElement";
import {ReferenceType} from "./ModelReference";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {RealTimeModel} from "../rt/RealTimeModel";

export interface ModelReferenceCallbacks {
  onPublish: (reference: LocalModelReference<any, any>) => void;
  onUnpublish: (reference: LocalModelReference<any, any>) => void;
  onSet: (reference: LocalModelReference<any, any>) => void;
  onClear: (reference: LocalModelReference<any, any>) => void;
}

export abstract class LocalModelReference<V, R extends ModelReference<V>> extends ConvergenceEventEmitter<ConvergenceEvent> {

  private _published: boolean;
  private _callbacks: ModelReferenceCallbacks;
  protected _reference: R;

  constructor(reference: R, callbacks: ModelReferenceCallbacks) {
    super();

    this._emitFrom(reference.events());
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

  source(): RealTimeElement<any> | RealTimeModel {
    return this._reference.source();
  }

  isLocal(): boolean {
    return true;
  }

  username(): string {
    return this._reference.username();
  }

  sessionId(): string {
    return this._reference.sessionId();
  }

  isDisposed(): boolean {
    return this._reference.isDisposed();
  }

  value(): V {
    return this._reference.value();
  }

  values(): V[] {
    return this._reference.values();
  }

  reference(): R {
    return this._reference;
  }

  share(): void {
    this._ensureAttached();
    this._published = true;
    this._callbacks.onPublish(this);
  }

  unshare(): void {
    this._ensureAttached();
    this._published = false;
    this._callbacks.onUnpublish(this);
  }

  isShared(): boolean {
    return this._published;
  }

  set(value: V): void;
  set(value: V[]): void;
  set(value: V | V[]): void {
    this._ensureAttached();

    if (value instanceof Array) {
      this._reference._set(value, true);
    } else {
      this._reference._set([value], true);
    }

    if (this.isShared()) {
      this._callbacks.onSet(this);
    }
  }

  clear(): void {
    this._ensureAttached();
    this._reference._clear();
    this._callbacks.onClear(this);
  }

  isSet(): boolean {
    return this._reference.isSet();
  }

  dispose(): void {
    this._ensureAttached();
    this.unshare();
    this._reference._dispose();
    this._callbacks = null;
  }

  private _ensureAttached(): void {
    if (this.type() !== ReferenceType.ELEMENT) {
      if (this.reference().source().isDetached()) {
        throw new Error("The source model is detached");
      }
    }
  }
}
