import {ModelReference} from "./ModelReference";
import {RealTimeValue} from "../rt/RealTimeValue";
import {DelegatingEventEmitter} from "../../util/DelegatingEventEmitter";
export interface ModelReferenceCallbacks {
  onPublish: (reference: LocalModelReference<any, any>) => void;
  onUnpublish: (reference: LocalModelReference<any, any>) => void;
  onSet: (reference: LocalModelReference<any, any>) => void;
  onClear: (reference: LocalModelReference<any, any>) => void;
}
export declare type ReferenceDisposedCallback = (reference: LocalModelReference<any, any>) => void;
export declare abstract class LocalModelReference<V, R extends ModelReference<V>> extends DelegatingEventEmitter {
  private _published;
  private _callbacks;
  protected _reference: R;
  private _disposeCallback;

  constructor(reference: R, callbacks: ModelReferenceCallbacks, disposeCallback: ReferenceDisposedCallback);

  type(): string;

  key(): string;

  source(): RealTimeValue<any>;

  isLocal(): boolean;

  username(): string;

  sessionId(): string;

  isDisposed(): boolean;

  value(): V;

  values(): V[];

  reference(): R;

  publish(): void;

  unpublish(): void;

  isPublished(): boolean;

  clear(): void;

  dispose(): void;

  set(value: V): void;
  set(value: V[]): void;

  isSet(): boolean;

  protected _fireSet(): void;

  private _ensureAttached();
}
