import {StringMapLike} from "../util/StringMap";
import {DomainUserIdMap} from "./DomainUserIdMap";
import {DomainUserIdentifier} from "./DomainUserIdentifier";

export type DomainUserMapping<T> = StringMapLike<T> | Map<DomainUserIdentifier, T> | DomainUserIdMap<T>;