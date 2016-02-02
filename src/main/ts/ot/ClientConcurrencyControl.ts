import ProcessedOperationEvent from "./ProcessedOperationEvent";
import Operation from "./ops/Operation";
import DiscreteOperation from "./ops/DiscreteOperation";
import UnprocessedOperationEvent from "./UnprocessedOperationEvent";
import EventEmitter from "../util/EventEmitter";
import CompoundOperation from "./ops/CompoundOperation";
import OperationTransformer from "./xform/OperationTransformer";
import OperationPair from "./xform/OperationPair";

export default class ClientConcurrencyControl extends EventEmitter {

  static get CommitState(): string {
    return "commitState";
  }

  private _clientId: string;

  private _compoundOpInProgress: boolean;
  private _pendingCompoundOperation: DiscreteOperation[];

  private _inflightOperations: Operation[];
  private _unappliedOperations: ProcessedOperationEvent[];

  private _contextVersion: number;
  private _transformer: OperationTransformer;

  constructor(clientId: string,
              contextVersion: number,
              unappliedOperations: ProcessedOperationEvent[],
              transformer: OperationTransformer) {
    super();

    this._clientId = clientId;
    this._contextVersion = contextVersion;
    this._unappliedOperations = unappliedOperations;
    this._inflightOperations = [];

    this._transformer = transformer;
    this._compoundOpInProgress = false;
    this._pendingCompoundOperation = [];
  }

  processIncomingOperation(incomingOperation: UnprocessedOperationEvent): void {
    if (incomingOperation.clientId === this._clientId) {
      this.processAcknowledgementOperation(incomingOperation);
    } else {
      this.processRemoteOperation(incomingOperation);
    }
  }

  hasNextIncomingOperation(): boolean {
    return this._unappliedOperations.length !== 0;
  }

  getNextIncomingOperation(): ProcessedOperationEvent {
    if (this._unappliedOperations.length === 0) {
      return null;
    } else {
      // todo: should we fire incoming reference if references are now
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
      var compoundOp: CompoundOperation = new CompoundOperation(this._pendingCompoundOperation);
      this._pendingCompoundOperation = [];
      this._inflightOperations.push(compoundOp);

      var event: UnprocessedOperationEvent = new UnprocessedOperationEvent(
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

  processOutgoingOperation(operation: DiscreteOperation): UnprocessedOperationEvent {
    if (this._compoundOpInProgress && !(operation instanceof DiscreteOperation)) {
      throw new Error("Can't process a compound operation that is in progress");
    }

    // transform against unapplied operations.
    var outgoingOperation: DiscreteOperation =
      this.transformOutgoing(this._unappliedOperations, operation);

    if (this._inflightOperations.length === 0 && this._pendingCompoundOperation.length === 0) {
      // we had no inflight ops or compound ops before. Now we have one.
      // so now we have uncommitted operations.
      this.emit(ClientConcurrencyControl.CommitState, false);
    }

    if (this._compoundOpInProgress) {
      // this cast is ok due to the check at the beginning of the method.
      this._pendingCompoundOperation.push(outgoingOperation);
      return null;
    } else {
      // todo We really don't need the time here. The client sends this out, and we are going
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

  private processAcknowledgementOperation(incomingOperation: UnprocessedOperationEvent): void {
    if (this._inflightOperations.length === 0) {
      throw new Error("Received an operation from this site, but with no operations in flight.");
    }
    this._inflightOperations.shift();
    // todo any verification to do?
    if (this._inflightOperations.length === 0 && this._pendingCompoundOperation.length === 0) {
      // we had inflight ops before. Now we have none. So now we have
      // changed commit state.
      this.emit(ClientConcurrencyControl.CommitState, true);
    }
  }

  private processRemoteOperation(incomingOperation: UnprocessedOperationEvent): void {
    if (incomingOperation.contextVersion > this._contextVersion) {
      throw new Error("Invalid context version.");
    }

    var remoteOperation: Operation = incomingOperation.operation;

    // forward transform the operation against the in flight operations to
    // prepare it to be applied to the data model.
    remoteOperation = this.transformIncoming(remoteOperation, this._inflightOperations);

    // forward transform the operation against the compound op (if there is
    // one) if it is not already in flight then it must come after the in
    // flight ops so we do this after handling the in flight.
    remoteOperation = this.transformIncoming(remoteOperation, this._pendingCompoundOperation);

    // add the processed operation to the incoming operations.
    this._unappliedOperations.push(new ProcessedOperationEvent(
      incomingOperation.clientId,
      incomingOperation.contextVersion,
      incomingOperation.timestamp,
      remoteOperation));
  }

  private transformIncoming(serverOp: Operation, clientOps: Operation[]): Operation {
    var sPrime: Operation = serverOp;
    for (var i: number = 0; i < clientOps.length; i++) {
      var opPair: OperationPair = this._transformer.transform(sPrime, clientOps[i]);
      sPrime = opPair.serverOp;
      clientOps[i] = opPair.clientOp;
    }
    return sPrime;
  }

  private transformOutgoing(serverOps: ProcessedOperationEvent[], clientOp: Operation): DiscreteOperation {
    var cPrime: Operation = clientOp;
    for (var i: number = 0; i < serverOps.length; i++) {
      var opPair: OperationPair = this._transformer.transform(serverOps[i].operation, cPrime);
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
