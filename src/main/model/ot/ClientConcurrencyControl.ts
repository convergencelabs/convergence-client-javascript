/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {ServerOperationEvent} from "./ServerOperationEvent";
import {Operation} from "./ops/Operation";
import {DiscreteOperation} from "./ops/DiscreteOperation";
import {ClientOperationEvent} from "./ClientOperationEvent";
import {CompoundOperation} from "./ops/CompoundOperation";
import {OperationTransformer} from "./xform/OperationTransformer";
import {OperationPair} from "./xform/OperationPair";
import {ModelReferenceData, ReferenceTransformer} from "./xform/ReferenceTransformer";
import {ConvergenceEventEmitter, IConvergenceEvent} from "../../util";

/**
 * @hidden
 * @internal
 */
export interface IClientConcurrencyControlEvent extends IConvergenceEvent {
  // empty
}

/**
 * @hidden
 * @internal
 */
export interface ICommitStatusChanged extends IClientConcurrencyControlEvent {
  name: "commit_state_changed";
  committed: boolean;
}

/**
 * @hidden
 * @internal
 */
export class ClientConcurrencyControl extends ConvergenceEventEmitter<IClientConcurrencyControlEvent> {

  public static Events: any = {
    COMMIT_STATE_CHANGED: "commit_state_changed"
  };

  private _lastSequenceNumber: number;

  private _compoundOpInProgress: boolean;
  private _pendingCompoundOperation: DiscreteOperation[];

  private readonly _inflightOperations: ClientOperationEvent[];
  private readonly _unappliedOperations: ServerOperationEvent[];

  private readonly _sessionId: () => string;
  private _contextVersion: number;
  private _transformer: OperationTransformer;
  private _referenceTransformer: ReferenceTransformer;

  constructor(sessionId: () => string,
              contextVersion: number,
              lastSequenceNumber: number,
              transformer: OperationTransformer,
              referenceTransformer: ReferenceTransformer) {
    super();

    this._sessionId = sessionId;
    this._lastSequenceNumber = lastSequenceNumber;
    this._contextVersion = contextVersion;
    this._unappliedOperations = [];
    this._inflightOperations = [];

    this._transformer = transformer;
    this._referenceTransformer = referenceTransformer;
    this._compoundOpInProgress = false;
    this._pendingCompoundOperation = [];
  }

  public lastSequenceNumber(): number {
    return this._lastSequenceNumber;
  }

  public setState(contextVersion: number, lastSequenceNumber: number, inFlight: ClientOperationEvent[]): void {
    this._contextVersion = contextVersion;
    this._lastSequenceNumber = lastSequenceNumber;

    this._inflightOperations.length = 0;
    this._inflightOperations.push(...inFlight);
  }

  public contextVersion(): number {
    return this._contextVersion;
  }

  public isCommitted(): boolean {
    return !this.hasInflightOperation() || this._pendingCompoundOperation.length > 0;
  }

  public hasInflightOperation(): boolean {
    return this._inflightOperations.length > 0;
  }

  public firstInFlightOperation(): ClientOperationEvent {
    return this._inflightOperations[0];
  }

  public getInFlightOperations(): ClientOperationEvent[] {
    return this._inflightOperations.slice(0);
  }

  public hasNextIncomingOperation(): boolean {
    return this._unappliedOperations.length !== 0;
  }

  public getNextIncomingOperation(): ServerOperationEvent {
    if (this._unappliedOperations.length === 0) {
      return null;
    } else {
      // todo: should we fire incoming reference if references are now
      //   available???
      return this._unappliedOperations.shift();
    }
  }

  public hasNextRemoteReference(): boolean {
    return this._unappliedOperations.length !== 0;
  }

  public getNextRemoteReferenceSetEvent(): ServerOperationEvent {
    if (this._unappliedOperations.length === 0) {
      return null;
    } else {
      // todo: should we fire incoming reference if references are now
      //   available???
      return this._unappliedOperations.shift();
    }
  }

  public startBatchOperation(): void {
    if (this._compoundOpInProgress) {
      throw new Error("Batch operation already in progress.");
    }

    this._pendingCompoundOperation = [];
    this._compoundOpInProgress = true;
  }

  public cancelBatchOperation(): void {
    if (!this._compoundOpInProgress) {
      throw new Error("Batch operation not in progress.");
    }

    if (this._pendingCompoundOperation.length !== 0) {
      throw new Error("Can not cancel a batch operation if operations have been issued.");
    }

    this._compoundOpInProgress = false;
  }

  public completeBatchOperation(): ClientOperationEvent {
    if (!this._compoundOpInProgress) {
      throw new Error("Batch operation not in progress.");
    }

    this._compoundOpInProgress = false;

    if (this._pendingCompoundOperation.length === 0) {
      throw new Error("A Batch operation must have at least one operation.");
    }

    const compoundOp: CompoundOperation = new CompoundOperation(this._pendingCompoundOperation);
    this._pendingCompoundOperation = [];
    // Notice we increment then get the value.
    const seqNo = ++this._lastSequenceNumber;
    const outgoingOperation = new ClientOperationEvent(
      this._sessionId(),
      seqNo,
      this._contextVersion,
      new Date(),
      compoundOp);
    this._inflightOperations.push(outgoingOperation);
    return outgoingOperation;
  }

  public batchSize(): number {
    return this._pendingCompoundOperation.length;
  }

  public isBatchOperationInProgress(): boolean {
    return this._compoundOpInProgress;
  }

  public processOutgoingOperation(operation: DiscreteOperation): ClientOperationEvent | null {
    if (this._compoundOpInProgress && !(operation instanceof DiscreteOperation)) {
      throw new Error("Can't process a compound operation that is in progress");
    }

    // transform against unapplied operations.
    const outgoingOperation: DiscreteOperation = this.transformOutgoing(this._unappliedOperations, operation);

    // Were we committed before? We were committed if there were no in flight
    // operations and no compound in progress.
    const wasCommitted = this._inflightOperations.length === 0 && this._pendingCompoundOperation.length === 0;

    let outgoingEvent: ClientOperationEvent | null = null;

    if (this._compoundOpInProgress) {
      this._pendingCompoundOperation.push(outgoingOperation);
    } else {
      outgoingEvent = new ClientOperationEvent(
        this._sessionId(),
        ++this._lastSequenceNumber,
        this._contextVersion,
        new Date(),
        outgoingOperation);
      this._inflightOperations.push(outgoingEvent);
    }

    if (wasCommitted) {
      // We were committed, but we are not now, so signal the state change.
      const evt: ICommitStatusChanged = {
        name: ClientConcurrencyControl.Events.COMMIT_STATE_CHANGED,
        committed: false
      };
      this._emitEvent(evt);
    }

    return outgoingEvent;
  }

  public processOutgoingSetReference(r: ModelReferenceData): ModelReferenceData {
    for (let i: number = 0; i < this._unappliedOperations.length && r; i++) {
      r = this._referenceTransformer.transform(this._unappliedOperations[i].operation, r);
    }
    return r;
  }

  public dispose(): void {
    // todo
  }

  public processAcknowledgement(version: number, seqNo?: number): ClientOperationEvent {
    if (this._inflightOperations.length === 0) {
      throw new Error("Received an acknowledgment, but had no uncommitted operations.");
    }

    if (this._contextVersion !== version) {
      throw new Error(`Acknowledgement did not meet expected context version of ${this._contextVersion}: ${version}`);
    }

    // FIXME when we are reconnecting we don't actually have the seq no.
    const acked = this._inflightOperations.shift();
    if (seqNo !== undefined) {
      if (acked.seqNo !== seqNo) {
        throw new Error(`Acknowledgement did not meet expected sequence number of ${acked.seqNo}: ${seqNo}`);
      }
    }

    this._contextVersion++;

    if (this._inflightOperations.length === 0 && this._pendingCompoundOperation.length === 0) {
      // To get an ack we must have had an inflight operation before, so we were in an
      // uncommitted state.  If we have no in flight operations now, and if there is no
      // pending compound operation, then we are not committed and should signal a
      // state transition.
      const evt: ICommitStatusChanged = {
        name: ClientConcurrencyControl.Events.COMMIT_STATE_CHANGED,
        committed: true
      };
      this._emitEvent(evt);
    }

    return acked;
  }

  public processRemoteOperation(incomingOperation: ServerOperationEvent): void {
    if (incomingOperation.version !== this._contextVersion) {
      throw new Error(
        `Invalid version of ${incomingOperation.version}, expected ${this._contextVersion}.`);
    }

    // forward transform the operation against the in flight operations to
    // prepare it to be applied to the data model.
    incomingOperation = this.transformInflightOperations(incomingOperation);

    // forward transform the operation against the compound op (if there is
    // one) if it is not already in flight then it must come after the in
    // flight ops so we do this after handling the in flight.
    incomingOperation = this.transformPendingCompoundOperations(incomingOperation);

    this._contextVersion++;

    // add the processed operation to the incoming operations.
    this._unappliedOperations.push(incomingOperation);
  }

  public processRemoteReferenceSet(r: ModelReferenceData): ModelReferenceData {
    for (let i: number = 0; i < this._inflightOperations.length && r; i++) {
      r = this._referenceTransformer.transform(this._inflightOperations[i].operation, r);
    }
    return r;
  }

  private transformInflightOperations(serverOp: ServerOperationEvent): ServerOperationEvent {
    let sPrime: Operation = serverOp.operation;

    for (let i: number = 0; i < this._inflightOperations.length; i++) {
      const opEvent = this._inflightOperations[i];
      const opPair: OperationPair = this._transformer.transform(sPrime, opEvent.operation);
      sPrime = opPair.serverOp;
      this._inflightOperations[i] = opEvent.copy({contextVersion: serverOp.version + 1, operation: opPair.clientOp});
    }

    return serverOp.copy({operation: sPrime});
  }

  private transformPendingCompoundOperations(serverOp: ServerOperationEvent): ServerOperationEvent {
    let sPrime: Operation = serverOp.operation;

    for (let i: number = 0; i < this._pendingCompoundOperation.length; i++) {
      const op = this._pendingCompoundOperation[i];
      const opPair: OperationPair = this._transformer.transform(sPrime, op);
      sPrime = opPair.serverOp;
      this._pendingCompoundOperation[i] = opPair.clientOp as DiscreteOperation;
    }

    return serverOp.copy({operation: sPrime});
  }

  private transformOutgoing(serverOps: ServerOperationEvent[], clientOp: Operation): DiscreteOperation {
    let cPrime: Operation = clientOp;
    for (let i: number = 0; i < serverOps.length; i++) {
      const serverOp = serverOps[i];
      const opPair: OperationPair = this._transformer.transform(serverOp.operation, cPrime);
      serverOps[i] = serverOp.copy({operation: opPair.serverOp});
      cPrime = opPair.clientOp;
    }
    return cPrime as DiscreteOperation;
  }
}
