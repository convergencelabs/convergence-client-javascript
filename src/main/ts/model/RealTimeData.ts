/// <reference path="../util/EventEmitter.ts" />

module convergence.model {
  import EventEmitter = convergence.util.EventEmitter;
  import DiscreteOperation = convergence.ot.DiscreteOperation;

  export enum DataType {Object, Array, String, Number, Boolean, Null, Undefined}

  export abstract class RealTimeData extends EventEmitter {

    public static create(data: any,
                         parent: RealTimeContainer,
                         fieldInParent: PathElement,
                         sendOpCallback: (operation: DiscreteOperation) => void): RealTimeData {
      var type: string = typeof data;
      if (data === null) {
        return new RealTimeNull(parent, fieldInParent, sendOpCallback);
      } else if (type === undefined) {
        return new RealTimeUndefined(parent, fieldInParent, sendOpCallback);
      } else if (type === "string") {
        return new RealTimeString(data, parent, fieldInParent, sendOpCallback);
      } else if (Array.isArray(data)) {
        return new RealTimeArray(data, parent, fieldInParent, sendOpCallback);
      } else if (type === "object") {
        return new RealTimeObject(data, parent, fieldInParent, sendOpCallback);
      } else if (type === "number") {
        return new RealTimeNumber(data, parent, fieldInParent, sendOpCallback);
      } else if (type === "boolean") {
        return new RealTimeBoolean(data, parent, fieldInParent, sendOpCallback);
      }
    }

    /**
     * Constructs a new RealTimeData.
     */
    constructor(private modelType: DataType,
                private parent: RealTimeData,
                public fieldInParent: PathElement,
                protected sendOpCallback: (operation: DiscreteOperation) => void) {
      super();
    }

    type(): DataType {
      return this.modelType;
    }

    abstract value(): any;

    path(): Path {
      var path: Path = this.parent.path();
      path.push(this.fieldInParent);
      return path;
    }

    protected abstract _handleIncomingOperation(operationEvent: ModelOperationEvent): void;

  }
}
