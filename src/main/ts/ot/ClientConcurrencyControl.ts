module convergence.ot {
  import EventEmitter = convergence.util.EventEmitter;

  export class ClientConcurrencyControl extends EventEmitter {

    static get CommitState() {
      return "commitState"
    };

    private _clientId:string;

    private _compoundOpInProgress:boolean;
    private _pendingCompoundOperation:DiscreteOperation[];

    private _inflightOperations:Operation[];
    private _unappliedOperations:ProcessedOperationEvent[];

    private _contextVersion:number;
    private _transformer:OperationTransformer;

    constructor(clientId:string,
                contextVersion:number,
                unappliedOperations: ProcessedOperationEvent[],
                transformer:OperationTransformer) {

      this._clientId = clientId;
      this._contextVersion = contextVersion;
      this._unappliedOperations = unappliedOperations;
      this._inflightOperations = [];

      this._transformer = transformer;
      this._compoundOpInProgress = false;
      this._pendingCompoundOperation = [];
    }

    processIncomingOperation(incomingOperation:UnprocessedOperationEvent):void {
      if (incomingOperation.clientId == this._clientId) {
        this.processAcknowledgementOperation(incomingOperation);
      } else {
        this.processRemoteOperation(incomingOperation);
      }
    }

    hasNextIncomingOperation():boolean {
      return this._unappliedOperations.length !== 0;
    }

    getNextIncomingOperation(): ProcessedOperationEvent {
      if (this._unappliedOperations.length === 0) {
        return null;
      } else {
        // TODO: should we fire incoming reference if references are now
        // available???
        return this._unappliedOperations.shift();
      }
    }

    startCompoundOperation(): void {
      if (this._compoundOpInProgress) {
        throw new Error("Compound operation already in progress.");
      }

      this._pendingCompoundOperation = [];
      this._compoundOpInProgress = true;
    }

    completeCompoundOperation(): UnprocessedOperationEvent {
      if (!this._compoundOpInProgress) {
        throw new Error("Compound operation not in progress.");
      }

      this._compoundOpInProgress = false;

      if (this._pendingCompoundOperation.length !== 0) {
        var compoundOp = new CompoundOperation(this._pendingCompoundOperation);
        this._pendingCompoundOperation = [];
        this._inflightOperations.push(compoundOp);

        var event = new UnprocessedOperationEvent(
          this._clientId,
          this._contextVersion,
          new Date().getTime(),
          compoundOp);

        return event;
      } else {
        return null;
      }
    }

    isCompoundOperationInProgress(): boolean {
      return this._compoundOpInProgress;
    }

    processOutgoingOperation(operation:DiscreteOperation):UnprocessedOperationEvent {
      if (this._compoundOpInProgress && !(operation instanceof DiscreteOperation)) {
        throw new Error("Can't process a compound operation that is in progress");
      }

      // Transform against unapplied operations.
      var outgoingOperation = this.transformOutgoing(this._unappliedOperations, operation);

      if (this._inflightOperations.length == 0 && this._pendingCompoundOperation.length == 0) {
        // We had no inflight ops or compound ops before. Now we have one.
        // So now we have uncommitted operations.
        this.emit(ClientConcurrencyControl.CommitState, false);
      }

      if (this._compoundOpInProgress) {
        // This cast is ok due to the check at the beginning of the method.
        this._pendingCompoundOperation.push(outgoingOperation);
        return null;
      } else {
        // TODO We really don't need the time here. The client sends this out, and we are going
        // to use the server time. We may want to refactor this whole holder concept.
        this._inflightOperations.push(outgoingOperation);
        return new UnprocessedOperationEvent(
          this._clientId,
          this._contextVersion,
          new Date().getTime(),
          outgoingOperation);
      }
    }

    dispose(): void {
      // todo
    }

    private processAcknowledgementOperation(incomingOperation:UnprocessedOperationEvent):void {
      if (this._inflightOperations.length == 0) {
        throw new Error("Received an operation from this site, but with no operations in flight.");
      }
      var acknowledgeOperation = this._inflightOperations.shift();
      if (this._inflightOperations.length == 0 && this._pendingCompoundOperation.length == 0) {
        // We had inflight ops before. Now we have none. So now we have
        // changed commit state.
        this.emit(ClientConcurrencyControl.CommitState, true);
      }
    }

    private processRemoteOperation(incomingOperation:UnprocessedOperationEvent):void {
      if (incomingOperation.contextVersion > this._contextVersion) {
        throw new Error("Invalid context version.");
      }

      var remoteOperation = incomingOperation.operation;

      // Forward transform the operation against the in flight operations to
      // prepare it to be applied to the data model.
      remoteOperation = this.transformIncoming(remoteOperation, this._inflightOperations);

      // Forward transform the operation against the compound op (if there is
      // one) if it is not already in flight then it must come after the in
      // flight ops so we do this after handling the in flight.
      remoteOperation = this.transformIncoming(remoteOperation, this._pendingCompoundOperation);

      // Add the processed operation to the incoming operations.
      this._unappliedOperations.push(new ProcessedOperationEvent(
        incomingOperation.clientId,
        incomingOperation.contextVersion,
        incomingOperation.timestamp,
        remoteOperation));
    }

    private transformIncoming(serverOp:Operation, clientOps:Operation[]):Operation {
      // Now we must transform the operation against our in flight operations
      // So that it can be applied to the model.
      var sPrime = serverOp;
      for (var i = 0; i < clientOps.length; i++) {
        var opPair = this._transformer.transform(sPrime, clientOps[i]);
        sPrime = opPair.serverOp;
        clientOps[i] = opPair.clientOp;
      }
      return sPrime;
    }

    private transformOutgoing(serverOps:ProcessedOperationEvent[], clientOp:Operation):DiscreteOperation {
      // Now we must transform the operation against our in flight operations
      // So that it can be applied to the model.
      var cPrime = clientOp;
      for (var i = 0; i < serverOps.length; i++) {
        var opPair = this._transformer.transform(serverOps[i].operation, cPrime);
        serverOps[i] = new ProcessedOperationEvent(
          serverOps[i].clientId,
          serverOps[i].contextVersion,
          serverOps[i].timestamp,
          opPair.serverOp
        );
        cPrime = opPair.clientOp;
      }
      return <DiscreteOperation>cPrime;
    }
  }
}