import { IdentityService } from "../../../main/ts/identity/IdentityService";
import { DomainUser } from "../../../main/ts/identity/DomainUser";
import { UserGroup } from "../../../main/ts/identity/UserGroup";
import { createStubInstance } from "sinon";
import { ConvergenceConnection } from "../../../main/ts/connection/ConvergenceConnection";
import { DomainUserType, DomainUserId } from "../../../main/ts/identity/DomainUserId";
import { expect } from "chai";
import { domainUserIdToProto } from "../../../main/ts/connection/ProtocolUtil";

import {io} from "@convergence-internal/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import IDomainUserData = io.convergence.proto.IDomainUserData;
import IUserListMessage = io.convergence.proto.IUserListMessage;
import { toUserGroup } from "../../../main/ts/identity/IdentityMessageUtils";

function createStubbedService(users: DomainUser[], groups?: UserGroup[]) {
  let connection = createStubInstance(ConvergenceConnection);

  connection.request = async (message: IConvergenceMessage) => {
    if (message.hasOwnProperty("usersGetRequest")) {
      return {
        userListResponse: {
          userData: users.map(u => {
            return {
              userId: domainUserIdToProto(u.userId)
            };
          }) as IDomainUserData[]
        }
      } as IUserListMessage;
    } else if (message.hasOwnProperty("userGroupsRequest")) {
      return {
        userGroupsResponse: {
          groupData: groups.map(g => {
            return {
              ...g,
              members: g.members.map(m => domainUserIdToProto(m))
            };
          })
        }
      };
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

  it("parses user groups correctly", async () => {
    let users: DomainUser[] = [
      new DomainUser(DomainUserType.NORMAL, "jimbo"),
      new DomainUser(DomainUserType.CONVERGENCE, "fred")
    ];

    let group = new UserGroup("test", "A Test", users.map(u => {
      return new DomainUserId(u.userType, u.username);
    }));

    let service = createStubbedService(users, [group]);

    let foundGroup = await service.group("test");

    expect(foundGroup.id).to.equal("test");
    expect(foundGroup.description).to.equal("A Test");
    expect(foundGroup.members.length).to.equal(2);

    expect(foundGroup.members[0].username).to.equal("jimbo");
    expect(foundGroup.members[0].userType).to.equal(DomainUserType.NORMAL);
    expect(foundGroup.members[1].username).to.equal("fred");
    expect(foundGroup.members[1].userType).to.equal(DomainUserType.CONVERGENCE);
  });
});
