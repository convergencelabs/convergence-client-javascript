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

/**
 * This represents a particular node in a [[HistoricalModel]]'s contents.  If you think
 * of the contents of a model as a JSON tree, this could be the root object, an array,
 * or any other element.
 *
 * Since [[HistoricalElement]]s represent a snapshot of a [[RealTimeModel]] in a given
 * moment in time, they are read-only.
 */
export abstract class HistoricalElement<T>
  extends ConvergenceEventEmitter<IConvergenceEvent> implements ObservableElement<T> {

  /**
   * An interface enumerating the different events that could be fired on this
   * [[HistoricalElement]].
   */
  public static readonly Events: HistoricalElementEvents = ObservableElementEventConstants;

  /**
   * @hidden
   * @internal
   */
  protected _delegate: ModelNode<T>;

  /**
   * @hidden
   * @internal
   */
  protected _wrapperFactory: HistoricalWrapperFactory;

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
  protected constructor(delegate: ModelNode<T>,
                        wrapperFactory: HistoricalWrapperFactory,
                        model: HistoricalModel) {
    super();

    this._delegate = delegate;
    this._wrapperFactory = wrapperFactory;
    this._model = model;

    this._delegate.events().subscribe((event: IConvergenceEvent) => {
      const convertedEvent: IConvergenceEvent = ModelEventConverter.convertEvent(event, this._wrapperFactory);
      this._emitEvent(convertedEvent);
    });
  }

  /**
   * Each node within a [[RealTimeModel]] has a system-generated ID that is unique
   * within this model's contents.
   */
  public id(): string {
    return this._delegate.id();
  }

  /**
   * This element's type.  See [[ModelElementType]] for an enumeration of types.
   */
  public type(): string {
    return this._delegate.type();
  }

  /**
   * The [[Path]] representing this element's location in the containing model's data.
   */
  public path(): Path {
    return this._delegate.path();
  }

  /**
   * This returns the [[PathElement]] representing this element's location relevant
   * to its parent. For example, given a model with contents
   *
   * ```json
   * {
   *   obj: {
   *     with: 1,
   *     stuff: ['a', 'string']
   *   }
   * }
   * ````
   *
   * ```typescript
   * let rtNumber = rtModel.elementAt(['obj', 'with']);
   * rtNumber.value() // 1
   * rtNumber.relativePath() // 'with'
   *
   * let rtString = rtModel.elementAt(['obj', 'stuff', 0]);
   * rtString.value() // 'a'
   * rtString.relativePath() // 0
   * ```
   *
   * @returns a PathElement representing this node's location relative to its parent,
   * or null if it has no parent.
   */
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
