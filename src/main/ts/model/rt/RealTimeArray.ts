import {RealTimeElement} from "./RealTimeElement";
import {RealTimeContainerElement} from "./RealTimeContainerElement";
import {ArrayNode} from "../internal/ArrayNode";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {RealTimeModel, ModelEventCallbacks} from "./RealTimeModel";
import {ArrayReplaceOperation} from "../ot/ops/ArrayReplaceOperation";
import {ArrayInsertOperation} from "../ot/ops/ArrayInsertOperation";
import {ArrayRemoveOperation} from "../ot/ops/ArrayRemoveOperation";
import {ArrayMoveOperation} from "../ot/ops/ArrayMoveOperation";
import {ArraySetOperation} from "../ot/ops/ArraySetOperation";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {
  ModelNodeEvent,
  ArrayNodeInsertEvent,
  ArrayNodeRemoveEvent,
  ArrayNodeReorderEvent,
  ArrayNodeSetEvent,
  ArrayNodeSetValueEvent
} from "../internal/events";
import {ObservableArray, ObservableArrayEvents, ObservableArrayEventConstants} from "../observable/ObservableArray";
import {Path, PathElement} from "../Path";

export interface RealTimeArrayEvents extends ObservableArrayEvents {
}

export class RealTimeArray extends RealTimeElement<any[]> implements ObservableArray, RealTimeContainerElement<any[]> {

  public static readonly Events: RealTimeArrayEvents = ObservableArrayEventConstants;

  /**
   * @hidden
   * @internal
   */
  protected _delegate: ArrayNode;

  /**
   * @hidden
   * @internal
   */
  protected _callbacks: ModelEventCallbacks;

  /**
   * Constructs a new RealTimeArray.
   *
   * @hidden
   * @internal
   */
  constructor(delegate: ArrayNode,
              callbacks: ModelEventCallbacks,
              _wrapperFactory: RealTimeWrapperFactory,
              _model: RealTimeModel) {
    super(delegate, callbacks, _wrapperFactory, _model, []);

    this._delegate.events().subscribe((event: ModelNodeEvent) => {
      if (event.local) {
        if (event instanceof ArrayNodeInsertEvent) {
          this._sendOperation(new ArrayInsertOperation(this.id(), false,
            event.index, event.src.get(event.index).dataValue()));
        } else if (event instanceof ArrayNodeRemoveEvent) {
          this._sendOperation(new ArrayRemoveOperation(this.id(), false, event.index));
        } else if (event instanceof ArrayNodeReorderEvent) {
          this._sendOperation(new ArrayMoveOperation(this.id(), false, event.fromIndex, event.toIndex));
        } else if (event instanceof ArrayNodeSetEvent) {
          const index: number = event.index;
          this._sendOperation(new ArrayReplaceOperation(this.id(), false, index, event.src.get(index).dataValue()));
        } else if (event instanceof ArrayNodeSetValueEvent) {
          this._sendOperation(new ArraySetOperation(this.id(), false, event.src.dataValue().children));
        }
      }
    });
  }

  public get(index: number): RealTimeElement<any> {
    return this._wrapperFactory.wrap(this._delegate.get(index));
  }

  public set(index: number, value: any): RealTimeElement<any> {
    this._assertWritable();
    return this._wrapperFactory.wrap(this._delegate.set(index, value));
  }

  public insert(index: number, value: any): RealTimeElement<any> {
    this._assertWritable();
    return this._wrapperFactory.wrap(this._delegate.insert(index, value));
  }

  public remove(index: number): RealTimeElement<any> {
    this._assertWritable();
    return this._wrapperFactory.wrap(this._delegate.remove(index));
  }

  public reorder(fromIndex: number, toIndex: number): void {
    this._assertWritable();
    this._delegate.reorder(fromIndex, toIndex);
  }

  public push(value: any): RealTimeElement<any> {
    this._assertWritable();
    return this._wrapperFactory.wrap(this._delegate.push(value));
  }

  public pop(): any {
    this._assertWritable();
    return this._delegate.pop();
  }

  public unshift(value: any): RealTimeElement<any> {
    this._assertWritable();
    return this._wrapperFactory.wrap(this._delegate.unshift(value));
  }

  public shift(): any {
    this._assertWritable();
    return this._delegate.shift();
  }

  public length(): number {
    return this._delegate.length();
  }

  public some(callback: (element: RealTimeElement<any>, index?: number) => boolean): boolean {
    return this._delegate.some((modelNode, index) => {
      return callback(this._wrapperFactory.wrap(modelNode), index);
    });
  }

  public every(callback: (element: RealTimeElement<any>, index?: number) => boolean): boolean {
    return this._delegate.every((modelNode, index) => {
      return callback(this._wrapperFactory.wrap(modelNode), index);
    });
  }

  public find(callback: (element: RealTimeElement<any>, index?: number) => boolean): RealTimeElement<any> {
    const node = this._delegate.find((modelNode, index) => {
      return callback(this._wrapperFactory.wrap(modelNode), index);
    });

    if (node === undefined) {
      return undefined;
    } else {
      return this._wrapperFactory.wrap(node);
    }
  }

  public findIndex(callback: (element: RealTimeElement<any>, index?: number) => boolean): number {
    return this._delegate.findIndex((modelNode, index) => {
      return callback(this._wrapperFactory.wrap(modelNode), index);
    });
  }

  public forEach(callback: (value: RealTimeElement<any>, index?: number) => void): void {
    this._delegate.forEach((modelNode, index) => {
      callback(this._wrapperFactory.wrap(modelNode), index);
    });
  }

  public elementAt(path: Path): RealTimeElement<any>;
  public elementAt(...elements: PathElement[]): RealTimeElement<any>;
  public elementAt(...path: any[]): RealTimeElement<any> {
    return this._wrapperFactory.wrap(this._delegate.valueAt(...path));
  }

  /**
   * @param relPath
   * @private
   * @internal
   * @hidden
   */
  public _removeChild(relPath: PathElement): void {
    if (typeof relPath !== "number") {
      throw new Error("The relative path of a child must be a number: " + (typeof relPath));
    }

    this.remove(relPath);
  }

  /**
   * @param event
   * @private
   * @internal
   * @hidden
   */
  public _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Arrays to do have references yet.");
  }
}
