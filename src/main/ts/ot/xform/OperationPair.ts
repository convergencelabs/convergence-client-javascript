import Operation from "../ops/Operation";

export default class OperationPair {
  _serverOp: Operation;
  _clientOp: Operation;

  constructor(serverOp: Operation, clientOp: Operation) {
    this._serverOp = serverOp;
    this._clientOp = clientOp;
  }

  get serverOp(): Operation {
    return this._serverOp;
  }

  get clientOp(): Operation {
    return this._clientOp;
  }
}

