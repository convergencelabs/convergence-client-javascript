import {Session} from "../Session";
import DomainUser from "./DomainUser";

export declare var UserField: any;
export declare class IdentityService {
  session(): Session;

  user(value: string, field?: string): Promise<DomainUser>;

  users(values: string | string[], field?: string): Promise<DomainUser[]>;

  search(fields: string | string[], value: string, offset?: number, limit?: number, orderBy?: string, ascending?: boolean): Promise<DomainUser[]>;
}
