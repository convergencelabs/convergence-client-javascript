import {RealTimeValue} from "./RealTimeValue";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {ArrayNode} from "../internal/ArrayNode";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ModelEventCallbacks} from "./RealTimeModel";
import {ArrayReplaceOperation} from "../ot/ops/ArrayReplaceOperation";
import {ArrayInsertOperation} from "../ot/ops/ArrayInsertOperation";
import {ArrayRemoveOperation} from "../ot/ops/ArrayRemoveOperation";
import {ArrayMoveOperation} from "../ot/ops/ArrayMoveOperation";
import {ArraySetOperation} from "../ot/ops/ArraySetOperation";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {ValueChangedEvent} from "../observable/ObservableValue";
import {ModelNodeEvent} from "../internal/events";
import {ArrayNodeInsertEvent} from "../internal/events";
import {ArrayNodeRemoveEvent} from "../internal/events";
import {ArrayNodeReorderEvent} from "../internal/events";
import {ArrayNodeSetEvent} from "../internal/events";
import {ArrayNodeSetValueEvent} from "../internal/events";

export class RealTimeArray extends RealTimeValue<any[]> implements RealTimeContainerValue<any[]> {

  static Events: any = {
    INSERT: "insert",
    REMOVE: "remove",
    SET: "set",
    REORDER: "reorder",
    VALUE: "value",
    DETACHED: RealTimeValue.Events.DETACHED,
    MODEL_CHANGED: RealTimeValue.Events.MODEL_CHANGED
  };

  /**
   * Constructs a new RealTimeArray.
   */
  constructor(protected _delegate: ArrayNode,
              private _wrapperFactory: RealTimeWrapperFactory,
              protected _callbacks: ModelEventCallbacks) {
    super(_delegate, _callbacks);

    this._delegate.events().subscribe((event: ModelNodeEvent) => {
      switch (event.name) {
        case(ArrayNode.Events.INSERT):
          let insertEvent: ArrayNodeInsertEvent = <ArrayNodeInsertEvent> event;
          if (insertEvent.local) {
            let operation: ArrayInsertOperation = new ArrayInsertOperation(
              this.id(),
              false,
              insertEvent.index,
              insertEvent.src.get(insertEvent.index).dataValue());
            this._sendOperation(operation);
          } else {
            this.emitEvent(<ArrayInsertEvent> {
              src: this,
              name: RealTimeArray.Events.INSERT,
              sessionId: insertEvent.sessionId,
              username: insertEvent.username,
              index: insertEvent.index,
              value: insertEvent.value
            });
          }
          break;
        case(ArrayNode.Events.REMOVE):
          let removeEvent: ArrayNodeRemoveEvent = <ArrayNodeRemoveEvent> event;
          if (removeEvent.local) {
            let operation: ArrayRemoveOperation = new ArrayRemoveOperation(this.id(), false, removeEvent.index);
            this._sendOperation(operation);
          } else {
            this.emitEvent(<ArrayRemoveEvent> {
              src: this,
              name: RealTimeArray.Events.REMOVE,
              sessionId: removeEvent.sessionId,
              username: removeEvent.username,
              index: removeEvent.index
            });
          }
          break;
        case(ArrayNode.Events.REORDER):
          let reorderEvent: ArrayNodeReorderEvent = <ArrayNodeReorderEvent> event;
          if (reorderEvent.local) {
            let operation: ArrayMoveOperation = new ArrayMoveOperation(this.id(), false, reorderEvent.fromIndex, reorderEvent.toIndex);
            this._sendOperation(operation);
          } else {
            this.emitEvent(<ArrayReorderEvent> {
              src: this,
              name: RealTimeArray.Events.REORDER,
              sessionId: reorderEvent.sessionId,
              username: reorderEvent.username,
              fromIndex: reorderEvent.fromIndex,
              toIndex: reorderEvent.toIndex
            });
          }
          break;
        case(ArrayNode.Events.SET):
          let setEvent: ArrayNodeSetEvent = <ArrayNodeSetEvent> event;
          if (setEvent.local) {
            let index: number = setEvent.index;
            let operation: ArrayReplaceOperation = new ArrayReplaceOperation(this.id(), false, index,
              setEvent.src.get(index).dataValue());
            this._sendOperation(operation);
          } else {
            this.emitEvent(<ArraySetEvent> {
              src: this,
              name: RealTimeArray.Events.SET,
              sessionId: setEvent.sessionId,
              username: setEvent.username,
              index: setEvent.index,
              value: setEvent.value
            });
          }
          break;
        case(ArrayNode.Events.VALUE):
          let setValueEvent: ArrayNodeSetValueEvent = <ArrayNodeSetValueEvent> event;
          if (setValueEvent.local) {
            let operation: ArraySetOperation = new ArraySetOperation(this.id(), false, setValueEvent.src.dataValue().children);
            this._sendOperation(operation);
          } else {
            this.emitEvent(<ArraySetValueEvent> {
              src: this,
              name: RealTimeArray.Events.VALUE,
              sessionId: setValueEvent.sessionId,
              username: setValueEvent.username,
              value: setValueEvent.value
            });
          }
          break;
        default:
        // Ignore unknown events
      }
    });
  }

  get(index: number): RealTimeValue<any> {
    return this._wrapperFactory.wrap(this._delegate.get(index));
  }


  set(index: number, value: any): RealTimeValue<any> {
    return this._wrapperFactory.wrap(this._delegate.set(index, value));
  }

  insert(index: number, value: any): RealTimeValue<any> {
    return this._wrapperFactory.wrap(this._delegate.insert(index, value));
  }

  remove(index: number): Object|number|string|boolean {
    return this._delegate.remove(index);
  }

  reorder(fromIndex: number, toIndex: number): void {
    this._delegate.reorder(fromIndex, toIndex);
  }

  push(value: any): RealTimeValue<any> {
    return this._wrapperFactory.wrap(this._delegate.push(value));
  }

  pop(): any {
    return this._delegate.pop();
  }

  unshift(value: any): RealTimeValue<any> {
    return this._wrapperFactory.wrap(this._delegate.unshift(value));
  }

  shift(): any {
    return this._delegate.shift();
  }

  length(): number {
    return this._delegate.length();
  }

  forEach(callback: (value: RealTimeValue<any>, index?: number) => void): void {
    this._delegate.forEach((modelNode, index) => {
      callback(this._wrapperFactory.wrap(modelNode), index);
    });
  }

  valueAt(pathArgs: any): RealTimeValue<any> {
    return this._wrapperFactory.wrap(this._delegate.valueAt(pathArgs));
  }

  //
  // protected and private methods.
  //

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Arrays to do have references yet.");
  }
}

export interface ArrayInsertEvent extends ValueChangedEvent {
  index: number;
  value: any;
}

export interface ArrayRemoveEvent extends ValueChangedEvent {
  index: number;
}

export interface ArraySetEvent extends ValueChangedEvent {
  index: number;
  value: any;
}

export interface ArrayReorderEvent extends ValueChangedEvent {
  fromIndex: number;
  toIndex: any;
}

export interface ArraySetValueEvent extends ValueChangedEvent {
  value: Array<any>;
}
