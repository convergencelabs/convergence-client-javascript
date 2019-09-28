export interface IObjectStoreSchema {
  Store: string;
  Indices: {[key: string]: string};
  Fields: {[key: string]: string};
}

export const IdbSchema = {
  ModelSubscriptions: {
    Store: "ModelSubscription",
    Indices: {
      ModelId: "ModelSubscription.modelId"
    },
    Fields: {
      ModelId: "modelId"
    }
  },
  Model: {
    Store: "Model",
    Indices: {
      Id: "Model.id"
    },
    Fields: {
      Id: "id"
    }
  },
  ModelServerOperation: {
    Store: "ModelServerOperation",
    Indices: {
      ModelId: "ModelServerOperation.modelId",
      ModelId_Version: "ModelServerOperation.modelId_version"
    },
    Fields: {
      ModelId: "modelId",
      Version: "version"
    }
  },
  ModelLocalOperation: {
    Store: "ModelLocalOperation",
    Indices: {
      ModelId: "ModelLocalOperation.modelId",
      ModelId_SequenceNumber: "ModelLocalOperation.modelId_sequenceNumber"
    },
    Fields: {
      ModelId: "modelId",
      SequenceNumber: "sequenceNumber"
    }
  }
};
