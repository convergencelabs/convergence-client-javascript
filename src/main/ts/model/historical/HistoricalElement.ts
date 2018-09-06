import {Path, PathElement} from "../Path";
import {ModelNode} from "../internal/ModelNode";
import {IConvergenceEvent, ConvergenceEventEmitter} from "../../util/";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {ModelEventConverter} from "../ModelEventConverter";
import {
  ObservableElement,
  ObservableElementEvents,
  ObservableElementEventConstants
} from "../observable/ObservableElement";
import {HistoricalModel} from "./HistoricalModel";
import {HistoricalContainerElement} from "./HistoricalContainerElement";

export interface HistoricalElementEvents extends ObservableElementEvents {
}

export abstract class HistoricalElement<T>
  extends ConvergenceEventEmitter<IConvergenceEvent> implements ObservableElement<T> {

  public static readonly Events: HistoricalElementEvents = ObservableElementEventConstants;

  /**
   * @internal
   */
  private readonly _model: HistoricalModel;

  /**
   * @param _delegate
   * @param _wrapperFactory
   * @param model
   *
   * @hidden
   * @internal
   */
  protected constructor(protected _delegate: ModelNode<T>,
                        protected _wrapperFactory: HistoricalWrapperFactory,
                        model: HistoricalModel) {
    super();

    this._model = model;

    this._delegate.events().subscribe((event: IConvergenceEvent) => {
      const convertedEvent: IConvergenceEvent = ModelEventConverter.convertEvent(event, this._wrapperFactory);
      this._emitEvent(convertedEvent);
    });
  }

  public id(): string {
    return this._delegate.id();
  }

  public type(): string {
    return this._delegate.type();
  }

  public path(): Path {
    return this._delegate.path();
  }

  public relativePath(): PathElement {
    const parentPath = this._delegate.path().slice(0);
    if (parentPath.length > 0) {
      return parentPath.pop();
    } else {
      return null;
    }
  }

  public parent(): HistoricalContainerElement<any> {
    const parentPath = this._delegate.path().slice(0);
    parentPath.pop();
    const parent = this._model.elementAt(parentPath);
    return parent as any as HistoricalContainerElement<any>;
  }

  public isAttached(): boolean {
    return !this._delegate.isDetached();
  }

  public isDetached(): boolean {
    return this._delegate.isDetached();
  }

  public value(): T {
    return this._delegate.data();
  }

  public toJSON(): any {
    return this._delegate.toJson();
  }

  public model(): HistoricalModel {
    return this._model;
  }
}
