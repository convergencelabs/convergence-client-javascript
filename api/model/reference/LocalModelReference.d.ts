import {ModelReference} from "./ModelReference";
import {RealTimeElement} from "../rt/RealTimeElement";
import {DelegatingEventEmitter} from "../../util/DelegatingEventEmitter";
import {RealTimeModel} from "../rt/RealTimeModel";
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

  source(): RealTimeElement<any> | RealTimeModel;

  isLocal(): boolean;

  username(): string;

  sessionId(): string;

  isDisposed(): boolean;

  value(): V;
  value(value: V): void;

  values(): V[];
  values(values: V[]): void;

  reference(): R;

  share(): void;

  unshare(): void;

  isShared(): boolean;

  clear(): void;

  dispose(): void;

  isSet(): boolean;

  protected _fireSet(): void;

  private _ensureAttached();
}
