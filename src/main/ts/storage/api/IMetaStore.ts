import {IDomainUserIdData} from "./IDomainUserIdData";

/**
 * @module Offline
 */
export interface IMetaStore {
  getDomainUserId(): Promise<IDomainUserIdData>;
}
