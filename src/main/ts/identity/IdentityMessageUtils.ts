import {ConvergenceError} from "../util";
import {DomainUser} from "./DomainUser";
import {fromOptional, protoToDomainUserType} from "../connection/ProtocolUtil";
import {UserField} from "./IdentityService";
import {io} from "@convergence/convergence-proto";
import IDomainUserData = io.convergence.proto.IDomainUserData;

export function toUserFieldCode(field: UserField): number {
  switch (field) {
    case "username":
      return 1;
    case "email":
      return 2;
    case "firstName":
      return 3;
    case "lastName":
      return 4;
    case "displayName":
      return 5;
    default:
      throw new ConvergenceError("Invalid user field: " + field);
  }
}

export function toDomainUser(userData: IDomainUserData): DomainUser {
  return new DomainUser(
    protoToDomainUserType(userData.userId.userType),
    userData.userId.username,
    fromOptional(userData.firstName),
    fromOptional(userData.lastName),
    fromOptional(userData.displayName),
    fromOptional(userData.email));
}