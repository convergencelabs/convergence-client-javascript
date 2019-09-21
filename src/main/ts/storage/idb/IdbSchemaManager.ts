import {IdbSchemaVersion1} from "./IdbSchemaVersion1";

export class IdbSchemaManager {
  public static upgrade(db: IDBDatabase, targetVersion: number) {
    switch (targetVersion) {
      case 1:
        IdbSchemaVersion1.upgrade(db);
      default:
        // no-op
    }
  }
}
