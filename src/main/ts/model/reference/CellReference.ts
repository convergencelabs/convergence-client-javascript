import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";
import RealTimeTable from "../RealTimeTable";

export interface CellRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export class CellReference extends ModelReference<CellRange> {

  constructor(key: string,
              source: RealTimeTable,
              userId: string,
              sessionId: string,
              local: boolean) {
    super(ReferenceType.CELL, key, source, userId, sessionId, local);
  }

  _handleInsertRow(index: number, length: number): void {
    // this._setIfChanged(IndexTransformer.handleInsert([this._value], index, length)[0]);
  }

  _handleRemoveRow(index: number, length: number): void {
    // this._setIfChanged(IndexTransformer.handleRemove([this._value], index, length)[0]);
  }

  _handleReorderRow(fromIndex: number, toIndex: number): void {
    // this._setIfChanged(IndexTransformer.handleReorder([this._value], fromIndex, toIndex)[0]);
  }

  _handleInsertCol(index: number, length: number): void {
    // this._setIfChanged(IndexTransformer.handleInsert([this._value], index, length)[0]);
  }

  _handleRemoveCol(index: number, length: number): void {
    // this._setIfChanged(IndexTransformer.handleRemove([this._value], index, length)[0]);
  }

  _handleReorderCol(fromIndex: number, toIndex: number): void {
    // this._setIfChanged(IndexTransformer.handleReorder([this._value], fromIndex, toIndex)[0]);
  }
}
