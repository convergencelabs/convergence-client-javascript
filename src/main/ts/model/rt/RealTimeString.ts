import {RealTimeElement} from "./RealTimeElement";
import {StringNode} from "../internal/StringNode";
import {ModelEventCallbacks} from "./RealTimeModel";
import {LocalModelReference} from "../reference/LocalModelReference";
import {ModelReference} from "../reference/ModelReference";
import {IndexReference} from "../reference/IndexReference";
import {StringInsertOperation} from "../ot/ops/StringInsertOperation";
import {StringRemoveOperation} from "../ot/ops/StringRemoveOperation";
import {LocalIndexReference} from "../reference/LocalIndexReference";
import {LocalRangeReference} from "../reference/LocalRangeReference";
import {RangeReference} from "../reference/RangeReference";
import {StringSetOperation} from "../ot/ops/StringSetOperation";
import {StringNodeInsertEvent} from "../internal/events";
import {StringNodeRemoveEvent} from "../internal/events";
import {StringNodeSetValueEvent} from "../internal/events";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ModelNodeEvent} from "../internal/events";
import {RealTimeModel} from "./RealTimeModel";
import {ObservableString, ObservableStringEvents, ObservableStringEventConstants} from "../observable/ObservableString";

export interface RealTimeStringEvents extends ObservableStringEvents {
}

export class RealTimeString extends RealTimeElement<string> implements ObservableString {

  public static readonly Events: RealTimeStringEvents = ObservableStringEventConstants;

  /**
   * Constructs a new RealTimeString.
   *
   * @hidden
   * @private
   */
  constructor(protected _delegate: StringNode,
              protected _callbacks: ModelEventCallbacks,
              _wrapperFactory: RealTimeWrapperFactory,
              _model: RealTimeModel) {
    super(_delegate, _callbacks, _wrapperFactory, _model, [ModelReference.Types.INDEX, ModelReference.Types.RANGE]);

    this._delegate.events().subscribe(e => this._handleReferenceModelEvents(e) );
  }

  public insert(index: number, value: string): void {
    this._assertWritable();
    this._delegate.insert(index, value);
  }

  public remove(index: number, length: number): void {
    this._assertWritable();
    this._delegate.remove(index, length);
  }

  public length(): number {
    return this._delegate.length();
  }

  /////////////////////////////////////////////////////////////////////////////
  // References
  /////////////////////////////////////////////////////////////////////////////

  // fixme the index and range reference methods are almost the same.  can we refactor?
  public indexReference(key: string): LocalIndexReference {
    const existing: LocalModelReference<any, any> = this._referenceManager.getLocalReference(key);
    if (existing !== undefined) {
      if (existing.reference().type() !== ModelReference.Types.INDEX) {
        throw new Error("A reference with this key already exists, but is not an index reference");
      } else {
        return <LocalIndexReference> existing;
      }
    } else {
      const reference: IndexReference = new IndexReference(
        this._referenceManager, key, this, this._delegate.username, this._delegate.sessionId, true);
      const local: LocalIndexReference = new LocalIndexReference(
        reference,
        this._callbacks.referenceEventCallbacks
      );
      this._referenceManager.addLocalReference(local);
      return local;
    }
  }

  public rangeReference(key: string): LocalRangeReference {
    const existing: LocalModelReference<any, any> = this._referenceManager.getLocalReference(key);
    if (existing !== undefined) {
      if (existing.reference().type() !== ModelReference.Types.RANGE) {
        throw new Error("A reference with this key already exists, but is not a range reference");
      } else {
        return <LocalRangeReference> existing;
      }
    } else {
      const reference: RangeReference = new RangeReference(
        this._referenceManager, key, this, this._delegate.username, this._delegate.sessionId, true);
      const local: LocalRangeReference = new LocalRangeReference(
        reference,
        this._callbacks.referenceEventCallbacks
      );
      this._referenceManager.addLocalReference(local);
      return local;
    }
  }

  public _handleReferenceModelEvents(event: ModelNodeEvent): void {
    if (event instanceof StringNodeInsertEvent) {
      if (event.local) {
        this._sendOperation(new StringInsertOperation(this.id(), false, event.index, event.value));
      }
      this._referenceManager.getAll().forEach((ref: ModelReference<any>) => {
        if (ref instanceof IndexReference) {
          ref._handleInsert(event.index, event.value.length);
        } else if (ref instanceof RangeReference) {
          ref._handleInsert(event.index, event.value.length);
        }
      });
    } else if (event instanceof StringNodeRemoveEvent) {
      if (event.local) {
        this._sendOperation(new StringRemoveOperation(this.id(), false, event.index, event.value));
      }
      this._referenceManager.getAll().forEach((ref: ModelReference<any>) => {
        if (ref instanceof IndexReference) {
          ref._handleRemove(event.index, event.value.length);
        } else if (ref instanceof RangeReference) {
          ref._handleRemove(event.index, event.value.length);
        }
      });
    } else if (event instanceof StringNodeSetValueEvent) {
      if (event.local) {
        this._sendOperation(new StringSetOperation(this.id(), false, event.value));
      }
      this._referenceManager.getAll().forEach((ref: ModelReference<any>) => {
        ref._dispose();
      });
      this._referenceManager.removeAll();
    }
  }
}
Object.freeze(RealTimeString.Events);
