/// <reference path="../util/EventEmitter.ts" />

module convergence.model {
  import EventEmitter = convergence.util.EventEmitter;

  export enum DataType {Object, Array, String, Number, Boolean, Null, Undefined}

  export class RealTimeData extends EventEmitter {

    public static createModel(data: any, parent: RealTimeData, fieldInParent: string|number): RealTimeData {
      var type: string = typeof data;
      if (data === null) {
        return new RealTimeNull(parent, fieldInParent);
      } else if (type === "string") {
        return new RealTimeString(data, parent, fieldInParent);
      } else if (Array.isArray(data)) {
        return new RealTimeArray(data, parent, fieldInParent);
      } else if (type === "object") {
        return new RealTimeObject(data, parent, fieldInParent);
      } else if (type === "number") {
        return new RealTimeNumber(data, parent, fieldInParent);
      } else if (type === "boolean") {
        return new RealTimeBoolean(data, parent, fieldInParent);
      }
    }

    /**
     * Constructs a new RealTimeData.
     */
    constructor(private modelType: DataType, private parent: RealTimeData, public fieldInParent: any) {
      super();
    }

    getType(): DataType {
      return this.modelType;
    }

    value(): any {
      // TODO: Implement
    }

    path(): Array<string | number> {
      var path: Array<string | number> = this.parent.path();
      path.push(this.fieldInParent);
      return path;
    }

    // TODO: make this abstract
    _handleIncomingOperation(operationEvent: ModelOperationEvent): void {

    }
  }
}
