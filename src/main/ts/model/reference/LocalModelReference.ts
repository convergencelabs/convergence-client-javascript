import {ModelReference, ModelReferenceEvents} from "./ModelReference";
import {RealTimeElement, RealTimeModel} from "../rt/";
import {IConvergenceEvent, ConvergenceEventEmitter} from "../../util/";

export interface ModelReferenceCallbacks {
  onShare: (reference: LocalModelReference<any, any>) => void;
  onUnshare: (reference: LocalModelReference<any, any>) => void;
  onSet: (reference: LocalModelReference<any, any>) => void;
  onClear: (reference: LocalModelReference<any, any>) => void;
}

export abstract class LocalModelReference<V, R extends ModelReference<V>>
extends ConvergenceEventEmitter<IConvergenceEvent> {

  public static readonly Events: ModelReferenceEvents = ModelReference.Events;

  /**
   * @hidden
   * @internal
   */
  protected _reference: R;

  /**
   * @internal
   */
  private _published: boolean;

  /**
   * @internal
   */
  private _callbacks: ModelReferenceCallbacks;

  /**
   * @param reference
   * @param callbacks
   *
   * @hidden
   * @internal
   */
  protected constructor(reference: R, callbacks: ModelReferenceCallbacks) {
    super();

    this._emitFrom(reference.events());
    this._reference = reference;
    this._published = false;
    this._callbacks = callbacks;
  }

  public type(): string {
    return this._reference.type();
  }

  public key(): string {
    return this._reference.key();
  }

  public source(): RealTimeElement<any> | RealTimeModel {
    return this._reference.source();
  }

  public isLocal(): boolean {
    return true;
  }

  public username(): string {
    return this._reference.username();
  }

  public sessionId(): string {
    return this._reference.sessionId();
  }

  public isDisposed(): boolean {
    return this._reference.isDisposed();
  }

  public value(): V {
    return this._reference.value();
  }

  public values(): V[] {
    return this._reference.values();
  }

  public reference(): R {
    return this._reference;
  }

  public share(): void {
    this._ensureAttached();
    this._published = true;
    this._callbacks.onShare(this);
  }

  public unshare(): void {
    this._ensureAttached();
    this._published = false;
    this._callbacks.onUnshare(this);
  }

  public isShared(): boolean {
    return this._published;
  }

  public set(value: V): void;
  public set(value: V[]): void;
  public set(value: V | V[]): void {
    this._ensureAttached();

    if (value instanceof Array) {
      this._reference._set(value, false);
    } else {
      this._reference._set([value], false);
    }

    if (this.isShared()) {
      this._callbacks.onSet(this);
    }
  }

  public clear(): void {
    this._ensureAttached();
    this._reference._clear();
    this._callbacks.onClear(this);
  }

  public isSet(): boolean {
    return this._reference.isSet();
  }

  public dispose(): void {
    this._ensureAttached();
    this.unshare();
    this._reference._dispose();
    this._callbacks = null;
  }

  /**
   * @hidden
   * @internal
   */
  private _ensureAttached(): void {
    if (this.type() !== ModelReference.Types.ELEMENT) {
      if (this.reference().source().isDetached()) {
        throw new Error("The source model is detached");
      }
    }
  }
}
