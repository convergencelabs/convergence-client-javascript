module convergence.model {
  import EventEmitter = convergence.util.EventEmitter;
  import Session = convergence.Session;

  export enum ModelType {Object, Array, String, Number, Boolean, Null, Undefined}

  export class Model extends EventEmitter {

    public static createModel(data: any, parent: Model, fieldInParent: any): Model {
      var type = typeof data;
      if (data === null) {
        return new RealTimeNull(parent, fieldInParent);
      } else if (type === "string") {
        return new RealTimeString(data, parent, fieldInParent);
      } else if (Array.isArray(data)) {
        return new RealTimeArray(data, parent, fieldInParent);
      } else if (type === "object") {
        return new RealTimeObject(data, parent, fieldInParent);
      } else if (type == "number") {
        return new RealTimeNumber(data, parent, fieldInParent);
      } else if (type == "boolean") {
        return new RealTimeBoolean(data, parent, fieldInParent);
      }
    }

    /**
     * Constructs a new Model.
     */
    constructor(private modelType, private parent: Model, public fieldInParent: any) {
      super();
    }

    getType(): ModelType {
      return this.modelType;
    }

    value(): any {
      //TODO: Implement
    }

    path(): Array<string | number> {
      //TODO: Implement
      return [];
    }
  }
}
