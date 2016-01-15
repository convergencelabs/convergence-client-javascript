/// <reference path="../ops/DiscreteOperation.ts" />

module convergence.ot {
  export class OperationPair {
    _serverOp:DiscreteOperation;
    _clientOp:DiscreteOperation;

    constructor(serverOp:DiscreteOperation, clientOp:DiscreteOperation) {
      this._serverOp = serverOp;
      this._clientOp = clientOp
    }

    get serverOp():DiscreteOperation {
      return this._serverOp;
    }

    get clientOp():DiscreteOperation {
      return this._clientOp;
    }
  }
}
