module convergence.model {

  export class RealTimeObject extends Model {

    private _children: any;

    /**
     * Constructs a new RealTimeObject.
     */
    constructor(data: any, parent: Model, fieldInParent: any) {
      super(ModelType.Object, parent, fieldInParent);

      this._children = {};

      for(var prop in data) {
        this._children[prop] = Model.createModel(data[prop], this, prop);
      }
    }


    /**
     * Returns a Model representing the child of this object at the path specified by
     * pathArgs. Because this class represents an object, the first instance of pathArgs
     * must be a string. All arguments must be either  strings or integers, dependent
     * on whether the model at that path level is an RealTimeObject or an RealTimeArray.
     * @param {...string|number} pathArgs Array of path arguments.
     * @returns {convergence.model.Model}
     */
    child(pathArgs): Model {
      // We're letting them pass in individual path arguments or a single array of path arguments
      var pathArgsForReal = Array.isArray(pathArgs) ? pathArgs : arguments;
      if (pathArgsForReal.length === 0) {
        throw new Error("Must at least specify the child index in the path");
      }
      var prop = pathArgsForReal[0];
      var child = this._children[prop];
      if (pathArgsForReal.length > 1) {
        if (child.getType() === ModelType.Object) {
          return (<RealTimeObject> child).child(pathArgsForReal.slice(1, pathArgsForReal.length));
        } else if (child.getType() === ModelType.Array) {
          return (<RealTimeArray> child).child(pathArgsForReal.slice(1, pathArgsForReal.length));
        } else {
          //TODO: Determine correct way to handle undefined
          return Model.createModel(undefined, null, null);
        }
      } else {
        return child;
      }
    }

  }
}