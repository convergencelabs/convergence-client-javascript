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

import {IdbSchema} from "./IdbSchema";

/**
 * @hidden
 * @internal
 */
export class IdbSchemaVersion1 {
  public static upgrade(db: IDBDatabase) {
    //
    // Model Creation Store
    //
    const localModelStore = db.createObjectStore(
      IdbSchema.ModelCreation.Store,
      {keyPath: IdbSchema.ModelCreation.Fields.ModelId});

    localModelStore.createIndex(
      IdbSchema.ModelCreation.Indices.ModelId,
      IdbSchema.ModelCreation.Fields.ModelId,
      {unique: true});

    //
    // Model Meta Data Store
    //
    const modelMetaData = db.createObjectStore(
      IdbSchema.ModelMetaData.Store,
      {keyPath: IdbSchema.ModelMetaData.Fields.ModelId});

    modelMetaData.createIndex(
      IdbSchema.ModelMetaData.Indices.ModelId,
      IdbSchema.ModelMetaData.Fields.ModelId,
      {unique: true});

    modelMetaData.createIndex(
      IdbSchema.ModelMetaData.Indices.Created,
      IdbSchema.ModelMetaData.Fields.Created,
      {unique: false});

    modelMetaData.createIndex(
      IdbSchema.ModelMetaData.Indices.Deleted,
      IdbSchema.ModelMetaData.Fields.Deleted,
      {unique: false});

    modelMetaData.createIndex(
      IdbSchema.ModelMetaData.Indices.Uncommitted,
      IdbSchema.ModelMetaData.Fields.Uncommitted,
      {unique: false});

    modelMetaData.createIndex(
      IdbSchema.ModelMetaData.Indices.SyncRequired,
      IdbSchema.ModelMetaData.Fields.SyncRequired,
      {unique: false});

    modelMetaData.createIndex(
      IdbSchema.ModelMetaData.Indices.Subscribed,
      IdbSchema.ModelMetaData.Fields.Subscribed,
      {unique: false});

    //
    // Model Data Store
    //
    const modelData = db.createObjectStore(
      IdbSchema.ModelData.Store,
      {keyPath: IdbSchema.ModelData.Fields.ModelId});

    modelData.createIndex(
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
          IdbSchema.ModelLocalOperation.Fields.SequenceNumber
        ]
      });

    localOperationStore.createIndex(
      IdbSchema.ModelLocalOperation.Indices.ModelId,
      IdbSchema.ModelLocalOperation.Fields.ModelId,
      {unique: false});

    localOperationStore.createIndex(
      IdbSchema.ModelLocalOperation.Indices.ModelId_SequenceNumber,
      [
        IdbSchema.ModelLocalOperation.Fields.ModelId,
        IdbSchema.ModelLocalOperation.Fields.SequenceNumber
      ],
      {unique: true});

    ///////////////////////////////////////////////////////////////////////////
    // Identity Schema
    ///////////////////////////////////////////////////////////////////////////

    //
    // Domain User Store
    //
    const userStore = db.createObjectStore(
      IdbSchema.DomainUser.Store,
      {
        keyPath: [
          IdbSchema.DomainUser.Fields.UserType,
          IdbSchema.DomainUser.Fields.Username,
        ]
      });

    userStore.createIndex(
      IdbSchema.DomainUser.Indices.UserType_Username,
      [
        IdbSchema.DomainUser.Fields.UserType,
        IdbSchema.DomainUser.Fields.Username,
      ],
      {unique: true});

    const sessionStore = db.createObjectStore(
      IdbSchema.Session.Store,
      {
        keyPath: [
          IdbSchema.Session.Fields.SessionId
        ]
      });

    sessionStore.createIndex(
      IdbSchema.Session.Indices.UserType_Username,
      [
        IdbSchema.Session.Fields.UserType,
        IdbSchema.Session.Fields.Username,
      ],
      {unique: false});

    sessionStore.createIndex(
      IdbSchema.Session.Indices.SessionId,
      [
        IdbSchema.Session.Fields.SessionId
      ],
      {unique: true});
  }
}
