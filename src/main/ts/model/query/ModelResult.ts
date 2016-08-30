export class ModelResult {
  constructor(public collectionId: string,
              public modelId: string,
              public created: Date,
              public modified: Date,
              public version: Date) {
    Object.freeze(this);
  }
}
