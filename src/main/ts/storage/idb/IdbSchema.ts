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
    Fields: {
      Id: "id",
      SessionId: "sessionId",
    },
    Indices: {
      Id: "Model.id",
      SessionId: "Model.SessionId",
      Id_SessionId: "Model.Id_SessionId",
    }
  },
  ModelServerOperation: {
    Store: "ModelServerOperation",
    Fields: {
      ModelId: "modelId",
      SessionId: "sessionId",
      Version: "version"
    },
    Indices: {
      ModelId: "ModelServerOperation.modelId",
      ModelId_Version: "ModelServerOperation.modelId_version"
    }
  },
  ModelLocalOperation: {
    Store: "ModelLocalOperation",
    Fields: {
      ModelId: "modelId",
      SessionId: "sessionId",
      SequenceNumber: "sequenceNumber"
    },
    Indices: {
      ModelId: "ModelLocalOperation.modelId",
      ModelId_SessionId_SequenceNumber: "ModelLocalOperation.modelId_sessionId_sequenceNumber"
    },
  }
};
