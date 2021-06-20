import {DomainUserIdMap} from "../identity";

export interface IAllPermissions<T extends string> {
  worldPermissions: Set<T>;
  userPermissions: DomainUserIdMap<Set<T>>;
  groupPermissions: Map<string, Set<T>>;
}