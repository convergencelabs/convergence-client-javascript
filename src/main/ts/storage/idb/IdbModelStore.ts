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

  public putModel(modelState: IModelState): Promise<void> {
    const {model, localOperations} = modelState;
    const stores = [IdbSchema.Model.Name, IdbSchema.ModelLocalOperation.Name, IdbSchema.ModelServerOperation.Name];
    return this._withWriteStores(stores, async ([modelStore, localOpStore, serverOpStore]) => {
      modelStore.put(model);
      IdbModelStore.deleteServerOperationsForModel(serverOpStore, model.id);
      IdbModelStore.deleteLocalOperationsForModel(localOpStore, model.id);
      IdbModelStore.putLocalOperationsForModel(localOpStore, localOperations);
    });
  }

  public processServerOperation(serverOp: IServerOperationData): Promise<void> {
    return this.put(IdbSchema.ModelServerOperation.Name, serverOp);
  }

  public processLocalOperation(localOp: ILocalOperationData): Promise<void> {
    return this.put(IdbSchema.ModelLocalOperation.Name, localOp);
  }

  public processOperationAck(modelId: string, seqNo: number, serverOp: IServerOperationData): Promise<void> {
    const stores = [IdbSchema.ModelLocalOperation.Name, IdbSchema.ModelServerOperation.Name];
    return this._withWriteStores(stores, async ([localOpStore, serverOpStore]) => {
      localOpStore.delete([modelId, seqNo]);
      serverOpStore.put(serverOp);
    });
  }

  public getModel(modelId: string): Promise<IModelState> {
    const stores = [IdbSchema.Model.Name, IdbSchema.ModelLocalOperation.Name];
    return this._withReadStores(stores, async ([modelStore, localOpStore]) => {
      const model = await toPromise(modelStore.get(modelId));
      const idx = localOpStore.index(IdbSchema.ModelLocalOperation.Indices.ModelId);
      const localOperations = await toPromise(idx.getAll(modelId));
      return {
        model,
        localOperations
      } as IModelState;
    });
  }

  public deleteModel(modelId: string): Promise<void> {
    const stores = [IdbSchema.Model.Name, IdbSchema.ModelLocalOperation.Name, IdbSchema.ModelServerOperation.Name];
    return this._withWriteStores(stores, async ([modelStore, localOpStore, serverOpStore]) => {
      modelStore.delete(modelId);
      IdbModelStore.deleteServerOperationsForModel(serverOpStore, modelId);
      IdbModelStore.deleteLocalOperationsForModel(localOpStore, modelId);
    });
  }
}
