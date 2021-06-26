import {StringMapLike} from "../util/StringMap";
import {DomainUserIdMap} from "./DomainUserIdMap";
import {DomainUserIdentifier} from "./DomainUserIdentifier";

/**
 * The DomainUserMapping type defines the union type for the multiple ways
 * a domain user might be mapped to a value.
 *
 * @module Users and Identity
 */
export type DomainUserMapping<T> = StringMapLike<T> | Map<DomainUserIdentifier, T> | DomainUserIdMap<T>;