import {IncomingProtocolResponseMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {DomainUser} from "../../../identity/DomainUser";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {DomainUserDeserializer} from "./DomainUser";

const userFieldCodes: {[key: string]: number} = {
  username: 1,
  firstName: 2,
  lastName: 3,
  displayName: 4,
  email: 5
};

/**
 * @hidden
 * @internal
 */
export interface UserLookUpRequest extends OutgoingProtocolRequestMessage {
  field: string;
  values: string[];
}

/**
 * @hidden
 * @internal
 */
export const UserLookUpRequestSerializer: MessageBodySerializer = (request: UserLookUpRequest) => {
  return {
    f: userFieldCodes[request.field],
    v: request.values
  };
};

/**
 * @hidden
 * @internal
 */
export interface UserSearchRequest extends OutgoingProtocolRequestMessage {
  fields: string[];
  value: string;
  offset: number;
  limit: number;
  orderBy: string;
  ascending: boolean;
}

/**
 * @hidden
 * @internal
 */
export const UserSearchRequestSerializer: MessageBodySerializer = (request: UserSearchRequest) => {
  let sort: number;

  if (request.ascending !== undefined) {
    sort = request.ascending ? 0 : 1;
  }

  return {
    f: request.fields.map((field: string) => {
      return userFieldCodes[field];
    }),
    v: request.value,
    o: request.offset,
    l: request.limit,
    r: userFieldCodes[request.orderBy],
    s: sort
  };
};

/**
 * @hidden
 * @internal
 */
export interface UserListResponse extends IncomingProtocolResponseMessage {
  users: DomainUser[];
}

/**
 * @hidden
 * @internal
 */
export const UserListResponseDeserializer: MessageBodyDeserializer<UserListResponse> = (body: any) => {
  const users: DomainUser[] = (body.u as any[]).map((u: any) => {
    return DomainUserDeserializer(u);
  });

  return {
    users
  };
};
