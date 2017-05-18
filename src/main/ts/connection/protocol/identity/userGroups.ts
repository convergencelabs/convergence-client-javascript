import {OutgoingProtocolRequestMessage} from "../protocol";
import {UserGroup} from "../../../identity/UserGroup";

export interface UserGroupsRequest extends OutgoingProtocolRequestMessage {
  ids?: string[];
}

export function UserGroupRequestSerializer(request: UserGroupsRequest): any {
  return {
    i: request.ids
  };
}

export interface UserGroupsResponse {
  groups: UserGroup[];
}

export function UserGroupsResponseDeserializer(body: any): UserGroupsResponse {
  const result: UserGroupsResponse = {
    groups: body.g.map((g: any) => deserializeUserGroup(g))
  };
  return result;
}

export function deserializeUserGroup(body: any): UserGroup {
  return new UserGroup(body.i, body.d, body.m);
}

export interface UserGroupsForUsersRequest extends OutgoingProtocolRequestMessage {
  usernames: string[];
}

export function UserGroupsForUsersRequestSerializer(request: UserGroupsForUsersRequest): any {
  return {
    u: request.usernames
  };
}

export interface UserGroupsForUsersResponse {
  groupsByUser: {[key: string]: string[]};
}

export function UserGroupsForUsersResponseDeserializer(body: any): UserGroupsForUsersResponse {
  const result: UserGroupsForUsersResponse = {
    groupsByUser: body.g
  };
  return result;
}
