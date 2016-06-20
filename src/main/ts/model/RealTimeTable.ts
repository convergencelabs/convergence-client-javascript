import {RealTimeValue} from "./RealTimeValue";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {PathElement} from "./ot/Path";
import {ModelEventCallbacks} from "./RealTimeModel";
import {RealTimeModel} from "./RealTimeModel";
import RealTimeValueType from "./RealTimeValueType";
import ModelOperationEvent from "./ModelOperationEvent";
import {RemoteReferenceEvent} from "../connection/protocol/model/reference/ReferenceEvent";
import {Path} from "./ot/Path";
import {LocalCellReference} from "./reference/LocalCellReference";

export interface TableDimensions {
  rows: number;
  cols: number;
}

export default class RealTimeTable extends RealTimeContainerValue<any[][]> {

  static Events: any = {
    CELL_CHANGED: "cell_changed",

    INSERT_ROW: "insert_row",
    REMOVE_ROW: "remove_row",
    REORDER_ROW: "reorder_row",

    INSERT_COLUMN: "insert_column",
    REMOVE_COLUMN: "remove_column",
    REORDER_COLUMN: "reorder_column",

    VALUE: "value",

    DETACHED: RealTimeValue.Events.DETACHED,
    MODEL_CHANGED: RealTimeValue.Events.MODEL_CHANGED
  };


  /**
   * Constructs a new RealTimeObject.
   */
  constructor(
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              callbacks: ModelEventCallbacks,
              model: RealTimeModel) {
    super(RealTimeValueType.Object, "fixme", parent, fieldInParent, callbacks, model);


  }

  dimensions(): TableDimensions {
    return;
  }

  /////////////////////////////////////////////////////////////////////////////
  // Cells
  /////////////////////////////////////////////////////////////////////////////

  setCell(row: number, column: number, value: any): void {

  }

  getCell(row: number, column: number): RealTimeValue<any> {
    return;
  }

  /////////////////////////////////////////////////////////////////////////////
  // Rows
  /////////////////////////////////////////////////////////////////////////////

  rowCount(): number {
    return 0;
  }

  rows(): RealTimeValue<any>[][] {
    return;
  }

  row(row: number): RealTimeValue<any>[] {
    return;
  }

  insertRow(index: number): void {

  }

  removeRow(index: number): void {

  }

  reorderRow(fromIndex: number, toIndex: number): void {

  }

  /////////////////////////////////////////////////////////////////////////////
  // Columns
  /////////////////////////////////////////////////////////////////////////////

  columnCount(): number {
    return 0;
  }

  insertColumn(index: number): void {

  }

  removeColumn(index: number): void {

  }

  reorderColumn(fromIndex: number, toIndex: number): void {

  }

  /////////////////////////////////////////////////////////////////////////////
  // References
  /////////////////////////////////////////////////////////////////////////////

  cellReference(key: string): LocalCellReference {
    return;
  }

  /////////////////////////////////////////////////////////////////////////////
  // Internal
  /////////////////////////////////////////////////////////////////////////////


  _path(pathArgs: Path): RealTimeValue<any> {
    return;
  }

  protected _detachChildren(): void {

  }


  protected _getValue(): any[][] {
    return;
  }

  protected _setValue(value?: any[][]): void {

  }


  /////////////////////////////////////////////////////////////////////////////
  // Handlers for incoming operations
  /////////////////////////////////////////////////////////////////////////////

  _handleRemoteOperation(operationEvent: ModelOperationEvent): void {

  }

  /////////////////////////////////////////////////////////////////////////////
  // Handlers for incoming operations
  /////////////////////////////////////////////////////////////////////////////

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    // fixme implement when we have object references.
    throw new Error("Objects to do have references yet.");
  }
}
