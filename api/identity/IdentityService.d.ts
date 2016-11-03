import {Session} from "../Session";
import DomainUser from "./DomainUser";
import {UserQuery} from "./UserQuery";

export declare var UserField: any;
export declare class IdentityService {
  session(): Session;

  user(username: string): Promise<DomainUser>;
  userByEmail(email: string): Promise<DomainUser>;

  users(values: string[]): Promise<DomainUser[]>;
  usersByEmail(values: string[]): Promise<DomainUser[]>;

  search(query: UserQuery): Promise<DomainUser[]>;
}
