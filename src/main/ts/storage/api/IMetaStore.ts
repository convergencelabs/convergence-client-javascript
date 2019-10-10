import {IDomainUserIdData} from "./IDomainUserIdData";

export interface IMetaStore {
  getDomainUserId(): Promise<IDomainUserIdData>;
}
