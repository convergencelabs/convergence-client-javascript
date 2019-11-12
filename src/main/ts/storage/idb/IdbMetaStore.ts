import {IdbPersistenceStore} from "./IdbPersistenceStore";
import {IDomainUserIdData, IMetaStore} from "../api/";

/**
 * @hidden
 * @internal
 */
export class IdbMetaStore extends IdbPersistenceStore implements IMetaStore {
  public getDomainUserId(): Promise<IDomainUserIdData> {
    return undefined;
  }
}
