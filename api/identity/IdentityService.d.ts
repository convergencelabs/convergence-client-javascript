import {Session} from "../Session";
import {DomainUser} from "./DomainUser";
import {UserQuery} from "./UserQuery";

export interface UserField {
  USERNAME: string;
  EMAIL: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  DISPLAY_NAME: string;
}

export declare const UserFields: UserField;

export declare class IdentityService {
  public session(): Session;

  public profile(): Promise<DomainUser>;

  public user(username: string): Promise<DomainUser>;
  public userByEmail(email: string): Promise<DomainUser>;

  public users(usernames: string[]): Promise<{[key: string]: DomainUser}>;
  public usersByEmail(emails: string[]): Promise<{[key: string]: DomainUser}>;

  public search(query: UserQuery): Promise<DomainUser[]>;
}
