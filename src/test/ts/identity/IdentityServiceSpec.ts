import { IdentityService } from "../../../main/ts/identity/IdentityService";
import { DomainUser } from "../../../main/ts/identity/DomainUser";
import { createStubInstance } from "sinon";
import { ConvergenceConnection } from "../../../main/ts/connection/ConvergenceConnection";
import { DomainUserType, DomainUserId } from "../../../main/ts/identity/DomainUserId";
import { expect } from "chai";
import { domainUserIdToProto } from "../../../main/ts/connection/ProtocolUtil";

import {io} from "@convergence-internal/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import IDomainUserData = io.convergence.proto.IDomainUserData;
import IUserListMessage = io.convergence.proto.IUserListMessage;

function createStubbedService(users: DomainUser[], groups?) {
  let connection = createStubInstance(ConvergenceConnection);

  connection.request = async (message: IConvergenceMessage) => {
    if (message.hasOwnProperty("usersGetRequest")) {
      return {
        userListResponse: {
          userData: users.map(u => {
            return  {
              userId: domainUserIdToProto(u.userId)
            };
          }) as IDomainUserData[]
        }
      } as IUserListMessage;
    }
  };

  return new IdentityService(connection);
}

describe("IdentityService", () => {

  it("can look up users by username", async () => {
    let users: DomainUser[] = [
      new DomainUser(DomainUserType.NORMAL, "jimbo"),
    ];

    let service = createStubbedService(users);

    let foundUser = await service.user("jimbo");
    return expect(foundUser.username).to.equal("jimbo");
  });

  it("can look up users by DomainUserId", async () => {
    let users: DomainUser[] = [
      new DomainUser(DomainUserType.NORMAL, "jimbo")
    ];

    let service = createStubbedService(users);

    let foundUser = await service.user(DomainUserId.normal("jimbo"));
    return expect(foundUser.username).to.equal("jimbo");
  });

  it("can look up users by both", async () => {
    let users: DomainUser[] = [
      new DomainUser(DomainUserType.NORMAL, "jimbo"),
      new DomainUser(DomainUserType.NORMAL, "fred")
    ];

    let service = createStubbedService(users);

    let foundUsers = await service.users([
      DomainUserId.normal("jimbo"),
      "fred",
    ]);

    expect(foundUsers.length).to.equal(2);
    expect(foundUsers[0].username).to.equal("jimbo");
    expect(foundUsers[1].username).to.equal("fred");
  });
});
