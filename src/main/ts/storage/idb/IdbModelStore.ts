import {IdbPersistenceStore} from "./IdbPersistenceStore";
import {ILocalOperationData, IModelStore, IServerOperationData} from "../api/";
import {toPromise} from "./promise";
import {IdbSchema} from "./IdbSchema";
import {IModelState} from "../api/IModelState";

export class IdbModelStore extends IdbPersistenceStore implements IModelStore {
  private static deleteServerOperationsForModel(store: IDBObjectStore, modelId: string): void {
    IdbPersistenceStore.deleteFromIndex(store,
      IdbSchema.ModelServerOperation.Indices.ModelId,
      IDBKeyRange.only(modelId));
  }

  private static deleteLocalOperationsForModel(store: IDBObjectStore, modelId: string): void {
    IdbPersistenceStore.deleteFromIndex(store,
      IdbSchema.ModelLocalOperation.Indices.ModelId,
      IDBKeyRange.only(modelId));
  }

  private static putLocalOperationsForModel(store: IDBObjectStore, operations: ILocalOperationData[]): void {
    operations.forEach(op => store.add(op));
  }

  private static putServerOperationsForModel(store: IDBObjectStore, operations: IServerOperationData[]): void {
    operations.forEach(op => store.add(op));
  }

  public putModel(modelState: IModelState): Promise<void> {
    const {model, localOperations, serverOperations} = modelState;
    const stores = [IdbSchema.Model.Store, IdbSchema.ModelLocalOperation.Store, IdbSchema.ModelServerOperation.Store];
    return this._withWriteStores(stores, async ([modelStore, localOpStore, serverOpStore]) => {
      modelStore.put(model);
      IdbModelStore.deleteServerOperationsForModel(serverOpStore, model.id);
      IdbModelStore.deleteLocalOperationsForModel(localOpStore, model.id);
      IdbModelStore.putLocalOperationsForModel(localOpStore, localOperations);
      IdbModelStore.putServerOperationsForModel(serverOpStore, serverOperations);
    });
  }

  public modelExists(modelId: string): Promise<boolean> {
    return this._withReadStore(IdbSchema.Model.Store, (store) => {
      const idx = store.index(IdbSchema.Model.Indices.Id);
      return toPromise(idx.count(modelId)).then((count => count > 0));
    });
  }

  public processServerOperation(serverOp: IServerOperationData): Promise<void> {
    return this.put(IdbSchema.ModelServerOperation.Store, serverOp);
  }

  public processLocalOperation(localOp: ILocalOperationData): Promise<void> {
    return this.put(IdbSchema.ModelLocalOperation.Store, localOp);
  }

  public processOperationAck(modelId: string, seqNo: number, serverOp: IServerOperationData): Promise<void> {
    const stores = [IdbSchema.ModelLocalOperation.Store, IdbSchema.ModelServerOperation.Store];
    return this._withWriteStores(stores, async ([localOpStore, serverOpStore]) => {
      localOpStore.delete([modelId, seqNo]);
      serverOpStore.put(serverOp);
    });
  }

  public getModel(modelId: string): Promise<IModelState | undefined> {
    const stores = [IdbSchema.Model.Store, IdbSchema.ModelLocalOperation.Store, IdbSchema.ModelServerOperation.Store];
    return this._withReadStores(stores, async ([modelStore, localOpStore, serverOpStore]) => {
      const model = await toPromise(modelStore.get(modelId));
      if (model) {
        const localOpsIndex = localOpStore.index(IdbSchema.ModelLocalOperation.Indices.ModelId);
        const localOperations = await toPromise(localOpsIndex.getAll(modelId));

        const serverOpsIndex = serverOpStore.index(IdbSchema.ModelServerOperation.Indices.ModelId);
        const serverOperations = await toPromise(serverOpsIndex.getAll(modelId));

        return {model, localOperations, serverOperations} as IModelState;
      } else {
        return;
      }
    });
  }

  public deleteModel(modelId: string): Promise<void> {
    const stores = [IdbSchema.Model.Store, IdbSchema.ModelLocalOperation.Store, IdbSchema.ModelServerOperation.Store];
    return this._withWriteStores(stores, async ([modelStore, localOpStore, serverOpStore]) => {
      modelStore.delete(modelId);
      IdbModelStore.deleteServerOperationsForModel(serverOpStore, modelId);
      IdbModelStore.deleteLocalOperationsForModel(localOpStore, modelId);
    });
  }
}
