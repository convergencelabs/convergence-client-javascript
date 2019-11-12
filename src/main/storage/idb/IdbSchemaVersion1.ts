/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {IdbSchema} from "./IdbSchema";

/**
 * @hidden
 * @internal
 */
export class IdbSchemaVersion1 {
  public static upgrade(db: IDBDatabase) {

    //
    // Model Subscription Store
    //
    const modelSubscriptionStore = db.createObjectStore(
      IdbSchema.ModelSubscriptions.Store,
      {keyPath: IdbSchema.ModelSubscriptions.Fields.ModelId});

    modelSubscriptionStore.createIndex(
      IdbSchema.ModelSubscriptions.Indices.ModelId,
      IdbSchema.ModelSubscriptions.Fields.ModelId,
      {unique: true});

    //
    // Local Model Store
    //
    const localModelStore = db.createObjectStore(
      IdbSchema.ModelCreation.Store,
      {keyPath: IdbSchema.ModelCreation.Fields.ModelId});

    localModelStore.createIndex(
      IdbSchema.ModelCreation.Indices.ModelId,
      IdbSchema.ModelCreation.Fields.ModelId,
      {unique: true});

    //
    // Model Snapshot Store
    //
    const modelSnapshotStore = db.createObjectStore(
      IdbSchema.ModelData.Store,
      {keyPath: IdbSchema.ModelData.Fields.ModelId});

    modelSnapshotStore.createIndex(
      IdbSchema.ModelData.Indices.ModelId,
      IdbSchema.ModelData.Fields.ModelId,
      {unique: true});

    //
    // Server Operation Store
    //
    const serverOperationStore = db.createObjectStore(
      IdbSchema.ModelServerOperation.Store,
      {keyPath: [IdbSchema.ModelServerOperation.Fields.ModelId, IdbSchema.ModelServerOperation.Fields.Version]});

    serverOperationStore.createIndex(
      IdbSchema.ModelServerOperation.Indices.ModelId,
      IdbSchema.ModelServerOperation.Fields.ModelId,
      {unique: false});

    serverOperationStore.createIndex(
      IdbSchema.ModelServerOperation.Indices.ModelId_Version,
      [IdbSchema.ModelServerOperation.Fields.ModelId, IdbSchema.ModelServerOperation.Fields.Version],
      {unique: true});

    //
    // Local Operation Store
    //
    const localOperationStore = db.createObjectStore(
      IdbSchema.ModelLocalOperation.Store,
      {
        keyPath: [
          IdbSchema.ModelLocalOperation.Fields.ModelId,
          IdbSchema.ModelLocalOperation.Fields.SessionId,
          IdbSchema.ModelLocalOperation.Fields.SequenceNumber
        ]
      });

    localOperationStore.createIndex(
      IdbSchema.ModelLocalOperation.Indices.ModelId,
      IdbSchema.ModelLocalOperation.Fields.ModelId,
      {unique: false});

    localOperationStore.createIndex(
      IdbSchema.ModelLocalOperation.Indices.ModelId_SessionId_SequenceNumber,
      [
        IdbSchema.ModelLocalOperation.Fields.ModelId,
        IdbSchema.ModelLocalOperation.Fields.SessionId,
        IdbSchema.ModelLocalOperation.Fields.SequenceNumber
      ],
      {unique: true});
  }
}
