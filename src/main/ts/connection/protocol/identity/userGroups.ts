import {IncomingProtocolResponseMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {UserGroup} from "../../../identity/UserGroup";

/**
 * @hidden
 * @internal
 */
export interface UserGroupsRequest extends OutgoingProtocolRequestMessage {
  ids?: string[];
}

/**
 * @hidden
 * @internal
 */
export function UserGroupRequestSerializer(request: UserGroupsRequest): any {
  return {
    i: request.ids
  };
}

/**
 * @hidden
 * @internal
 */
export interface UserGroupsResponse extends IncomingProtocolResponseMessage {
  groups: UserGroup[];
}

/**
 * @hidden
 * @internal
 */
export function UserGroupsResponseDeserializer(body: any): UserGroupsResponse {
  const result: UserGroupsResponse = {
    groups: body.g.map((g: any) => deserializeUserGroup(g))
  };
  return result;
}

/**
 * @hidden
 * @internal
 */
export function deserializeUserGroup(body: any): UserGroup {
  return new UserGroup(body.i, body.d, body.m);
}

/**
 * @hidden
 * @internal
 */
export interface UserGroupsForUsersRequest extends OutgoingProtocolRequestMessage {
  usernames: string[];
}

/**
 * @hidden
 * @internal
 */
export function UserGroupsForUsersRequestSerializer(request: UserGroupsForUsersRequest): any {
  return {
    u: request.usernames
  };
}

/**
 * @hidden
 * @internal
 */
export interface UserGroupsForUsersResponse extends IncomingProtocolResponseMessage {
  groupsByUser: {[key: string]: string[]};
}

/**
 * @hidden
 * @internal
 */
export function UserGroupsForUsersResponseDeserializer(body: any): UserGroupsForUsersResponse {
  const result: UserGroupsForUsersResponse = {
    groupsByUser: body.g
  };
  return result;
}
