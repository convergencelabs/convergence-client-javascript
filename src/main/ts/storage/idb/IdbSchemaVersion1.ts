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
    // Model Store
    //
    const modelStore = db.createObjectStore(
      IdbSchema.Model.Store,
      {keyPath: IdbSchema.Model.Fields.Id});

    modelStore.createIndex(
      IdbSchema.Model.Indices.Id,
      IdbSchema.Model.Fields.Id,
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
