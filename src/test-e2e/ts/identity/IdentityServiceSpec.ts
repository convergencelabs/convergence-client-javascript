import {DoneType} from "../../mock-server/MockConvergenceServer";
import {IMockServerOptions} from "../../mock-server/MockConvergenceServer";
import {MockConvergenceServer} from "../../mock-server/MockConvergenceServer";
import {MessageType} from "../../../main/ts/connection/protocol/MessageType";
import {IReceiveRequestRecord} from "../../mock-server/records";
import {DomainUser} from "../../../main/ts/identity/DomainUser";
import * as chai from "chai";
import ExpectStatic = Chai.ExpectStatic;
import {UserFields} from "../../../main/ts/identity/IdentityService";
import {Convergence} from "../../../main/ts/Convergence";

const expect: ExpectStatic = chai.expect;

const url: string = "ws://localhost:8085/domain/namespace1/domain1";
const expectedSuccessOptions: Function = (done: MochaDone) => {
  return <IMockServerOptions> {
    url,
    doneType: DoneType.MOCHA,
    mochaDone: done,
    autoHandshake: true,
    handshakeTimeout: 200,
    autoTokenAuth: true,
    authExpectedToken: "token"
  };
};

describe("IdentityService.user()", () => {

  it("must resolve with the correct user", (done: MochaDone) => {
    const mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    const req: IReceiveRequestRecord =
      mockServer.expectRequest({t: MessageType.USER_LOOKUP_REQUEST, f: 1, v: ["test1"]});
    mockServer.sendReplyTo(req, {
      t: MessageType.USER_LIST_RESPONSE, u: [
        {n: "test1", f: "test", l: "user", d: "test user", e: "test@example.com"}
      ]
    });
    mockServer.start();

    Convergence.connectWithJwt(mockServer.url(), "token").then(domain => {
      return domain.identity().user("test1");
    }).then((user: DomainUser) => {
      expect(user).to.exist;
      expect(user.username).to.equal("test1");
      expect(user.firstName).to.equal("test");
      expect(user.lastName).to.equal("user");
      expect(user.displayName).to.equal("test user");
      expect(user.email).to.equal("test@example.com");
      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });

  it("must resolve with undefined if no user is found", (done: MochaDone) => {
    const mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    const req: IReceiveRequestRecord = mockServer.expectRequest({t: MessageType.USER_LOOKUP_REQUEST, f: 1, v: ["u1"]});
    mockServer.sendReplyTo(req, {t: MessageType.USER_LIST_RESPONSE, u: []});
    mockServer.start();

    Convergence.connectWithJwt(mockServer.url(), "token").then(domain => {
      return domain.identity().user("u1");
    }).then((user: DomainUser) => {
      expect(user).to.be.undefined;
      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });

  it("must reject if more than one user is returned", (done: MochaDone) => {
    const mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    const req: IReceiveRequestRecord = mockServer.expectRequest({t: MessageType.USER_LOOKUP_REQUEST, f: 1, v: ["u1"]});
    mockServer.sendReplyTo(req, {
      t: MessageType.USER_LIST_RESPONSE, u: [
        {i: "u1", n: "test1", f: "test", l: "user", d: "test user", e: "test@example.com"},
        {i: "u2", n: "test2", f: "test2", l: "user2", d: "test2 user2", e: "test2@example.com"}
      ]
    });
    mockServer.start();

    Convergence.connectWithJwt(mockServer.url(), "token").then(domain => {
      return domain.identity().user("u1");
    }).then((user: DomainUser) => {
      mockServer.doneManager().testFailure(
        new Error("user() resolved, even though multiple users were returned from the server"));
    }).catch((error: Error) => {
      mockServer.doneManager().testSuccess();
    });
  });

  it("must reject the promise if no userId is specified", (done: MochaDone) => {
    const mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    mockServer.start();

    Convergence.connectWithJwt(mockServer.url(), "token").then(domain => {
      return domain.identity().user(null);
    }).then((user: DomainUser) => {
      mockServer.doneManager().testFailure(new Error("The promise was incorrectly resolved"));
    }).catch((error: Error) => {
      mockServer.doneManager().testSuccess();
    });
  });

  it("must send field code 1 if USERNAME is specified", (done: MochaDone) => {
    const mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    const req: IReceiveRequestRecord = mockServer.expectRequest({t: MessageType.USER_LOOKUP_REQUEST, f: 1, v: ["u1"]});
    mockServer.sendReplyTo(req, {t: MessageType.USER_LIST_RESPONSE, u: []});
    mockServer.start();

    Convergence.connectWithJwt(mockServer.url(), "token").then(domain => {
      return domain.identity().user("u1");
    }).then((user: DomainUser) => {
      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });

  it("must send field code 5 if EMAIL is specified", (done: MochaDone) => {
    const mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    const req: IReceiveRequestRecord = mockServer.expectRequest({t: MessageType.USER_LOOKUP_REQUEST, f: 5, v: ["u1"]});
    mockServer.sendReplyTo(req, {t: MessageType.USER_LIST_RESPONSE, u: []});
    mockServer.start();

    Convergence.connectWithJwt(mockServer.url(), "token").then(domain => {
      return domain.identity().userByEmail("u1");
    }).then((user: DomainUser) => {
      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });
});

describe("IdentityService.search()", () => {
  it("must resolve with the proper users that were returned", (done: MochaDone) => {
    const mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    const req: IReceiveRequestRecord = mockServer.expectRequest(
      {t: MessageType.USER_SEARCH_REQUEST, f: [2, 3], v: "keyword"});

    mockServer.sendReplyTo(req, {
      t: MessageType.USER_LIST_RESPONSE, u: [
        {i: "u1", n: "test1", f: "test", l: "user", d: "test user", e: "test@example.com"},
        {i: "u2", n: "test2", f: "test2", l: "user2", d: "test2 user2", e: "test2@example.com"}
      ]
    });
    mockServer.start();

    Convergence.connectWithJwt(mockServer.url(), "token").then(domain => {
      return domain.identity().search({
        term: "keyword",
        fields: [UserFields.FIRST_NAME, UserFields.LAST_NAME]
      });
    }).then((users: DomainUser[]) => {
      expect(users.length).to.equal(2);

      const user1: DomainUser = users[0];
      expect(user1.username).to.equal("test1");
      expect(user1.firstName).to.equal("test");
      expect(user1.lastName).to.equal("user");
      expect(user1.displayName).to.equal("test user");
      expect(user1.email).to.equal("test@example.com");

      const user2: DomainUser = users[1];
      expect(user2.username).to.equal("test2");
      expect(user2.firstName).to.equal("test2");
      expect(user2.lastName).to.equal("user2");
      expect(user2.displayName).to.equal("test2 user2");
      expect(user2.email).to.equal("test2@example.com");

      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });

  it("must resolve with an empty array if no users are returned", (done: MochaDone) => {
    const mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    const req: IReceiveRequestRecord = mockServer.expectRequest(
      {t: MessageType.USER_SEARCH_REQUEST, f: [2, 3], v: "keyword"});
    mockServer.sendReplyTo(req, {t: MessageType.USER_LIST_RESPONSE, u: []});
    mockServer.start();

    Convergence.connectWithJwt(mockServer.url(), "token").then(domain => {
      return domain.identity().search({
        term: "keyword",
        fields: [UserFields.FIRST_NAME, UserFields.LAST_NAME]
      });
    }).then((users: DomainUser[]) => {
      expect(users.length).to.equal(0);
      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });

  it("must reject the promise if no fields are specified", (done: MochaDone) => {
    const mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    mockServer.start();

    Convergence.connectWithJwt(mockServer.url(), "token").then(domain => {
      return domain.identity().search({term: "keyword", fields: []});
    }).then((user: DomainUser[]) => {
      mockServer.doneManager().testFailure(new Error("The promise was incorrectly resolved"));
    }).catch((error: Error) => {
      mockServer.doneManager().testSuccess();
    });
  });

  it("must reject the promise if no value is specified", (done: MochaDone) => {
    const mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    mockServer.start();

    Convergence.connectWithJwt(mockServer.url(), "token").then(domain => {
      return domain.identity().search({fields: "username", term: null});
    }).then((user: DomainUser[]) => {
      mockServer.doneManager().testFailure(new Error("The promise was incorrectly resolved"));
    }).catch((error: Error) => {
      mockServer.doneManager().testSuccess();
    });
  });
});
