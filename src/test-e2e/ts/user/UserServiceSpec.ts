import {DoneType} from "../../mock-server/MockConvergenceServer";
import {IMockServerOptions} from "../../mock-server/MockConvergenceServer";
import ConvergenceDomain from "../../../main/ts/ConvergenceDomain";
import {MockConvergenceServer} from "../../mock-server/MockConvergenceServer";
import MessageType from "../../../main/ts/connection/protocol/MessageType";
import {IReceiveRequestRecord} from "../../mock-server/records";
import DomainUser from "../../../main/ts/user/DomainUser";
import * as chai from "chai";
import ExpectStatic = Chai.ExpectStatic;
import {UserField} from "../../../main/ts/user/UserService";

var expect: ExpectStatic = chai.expect;

var url: string = "ws://localhost:8085/domain/namespace1/domain1";
var expectedSuccessOptions: Function = function(done: MochaDone): IMockServerOptions {
  return {
    url: url,
    doneType: DoneType.MOCHA,
    mochaDone: done,
    autoHandshake: true,
    handshakeTimeout: 200,
    autoTokenAuth: true,
    authExpectedToken: "token"
  };
};

describe('UserService.getUser()', () => {

  it('must resolve with the correct user', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    var req: IReceiveRequestRecord = mockServer.expectRequest({t: MessageType.USER_LOOKUP_REQUEST, f: 0, v: ["u1"]});
    mockServer.sendReplyTo(req, {
      t: MessageType.USER_LIST_RESPONSE, u: [
        {i: "u1", n: "test1", f: "test", l: "user", e: "test@example.com"}
      ]
    });
    mockServer.start();

    var domain: ConvergenceDomain = new ConvergenceDomain(mockServer.url());
    domain.authenticateWithToken("token").then(() => {
      return domain.userService().getUser("u1");
    }).then((user: DomainUser) => {
      expect(user.uid).to.equal("u1");
      expect(user.username).to.equal("test1");
      expect(user.firstName).to.equal("test");
      expect(user.lastName).to.equal("user");
      expect(user.email).to.equal("test@example.com");
      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });

  it('must resolve with undefined if no user is found', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    var req: IReceiveRequestRecord = mockServer.expectRequest({t: MessageType.USER_LOOKUP_REQUEST, f: 0, v: ["u1"]});
    mockServer.sendReplyTo(req, {t: MessageType.USER_LIST_RESPONSE, u: []});
    mockServer.start();

    var domain: ConvergenceDomain = new ConvergenceDomain(mockServer.url());
    domain.authenticateWithToken("token").then(() => {
      return domain.userService().getUser("u1");
    }).then((user: DomainUser) => {
      expect(user).to.be.undefined;
      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });

  it('must reject if more than one user is returned', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    var req: IReceiveRequestRecord = mockServer.expectRequest({t: MessageType.USER_LOOKUP_REQUEST, f: 0, v: ["u1"]});
    mockServer.sendReplyTo(req, {
      t: MessageType.USER_LIST_RESPONSE, u: [
        {i: "u1", n: "test1", f: "test", l: "user", e: "test@example.com"},
        {i: "u2", n: "test2", f: "test2", l: "user2", e: "test2@example.com"}
      ]
    });
    mockServer.start();

    var domain: ConvergenceDomain = new ConvergenceDomain(mockServer.url());
    domain.authenticateWithToken("token").then(() => {
      return domain.userService().getUser("u1");
    }).then((user: DomainUser) => {
      mockServer.doneManager().testFailure(
        new Error("getUser() resolved, even though multiple users were returned from the server"));
    }).catch((error: Error) => {
      mockServer.doneManager().testSuccess();
    });
  });

  it('must reject the promise if no userId is specified', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    mockServer.start();

    var domain: ConvergenceDomain = new ConvergenceDomain(mockServer.url());
    domain.authenticateWithToken("token").then(() => {
      return domain.userService().getUser(null);
    }).then((user: DomainUser) => {
      mockServer.doneManager().testFailure(new Error("The promise was incorrectly resolved"));
    }).catch((error: Error) => {
      mockServer.doneManager().testSuccess();
    });
  });

  it('must send field code 1 if USERNAME is specified', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    var req: IReceiveRequestRecord = mockServer.expectRequest({t: MessageType.USER_LOOKUP_REQUEST, f: 1, v: ["u1"]});
    mockServer.sendReplyTo(req, {t: MessageType.USER_LIST_RESPONSE, u: []});
    mockServer.start();

    var domain: ConvergenceDomain = new ConvergenceDomain(mockServer.url());
    domain.authenticateWithToken("token").then(() => {
      return domain.userService().getUser("u1", UserField.USERNAME);
    }).then((user: DomainUser) => {
      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });

  it('must send field code 4 if USERNAME is specified', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    var req: IReceiveRequestRecord = mockServer.expectRequest({t: MessageType.USER_LOOKUP_REQUEST, f: 4, v: ["u1"]});
    mockServer.sendReplyTo(req, {t: MessageType.USER_LIST_RESPONSE, u: []});
    mockServer.start();

    var domain: ConvergenceDomain = new ConvergenceDomain(mockServer.url());
    domain.authenticateWithToken("token").then(() => {
      return domain.userService().getUser("u1", UserField.EMAIL);
    }).then((user: DomainUser) => {
      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });
});

describe('UserService.searchUsers()', () => {
  it('must resolve with the proper users that were returned', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    var req: IReceiveRequestRecord = mockServer.expectRequest(
      {t: MessageType.USER_SEARCH_REQUEST, f: [2, 3], v: "keyword"});

    mockServer.sendReplyTo(req, {
      t: MessageType.USER_LIST_RESPONSE, u: [
        {i: "u1", n: "test1", f: "test", l: "user", e: "test@example.com"},
        {i: "u2", n: "test2", f: "test2", l: "user2", e: "test2@example.com"}
      ]
    });
    mockServer.start();

    var domain: ConvergenceDomain = new ConvergenceDomain(mockServer.url());
    domain.authenticateWithToken("token").then(() => {
      return domain.userService().searchUsers(["firstName", "lastName"], "keyword");
    }).then((users: DomainUser[]) => {
      expect(users.length).to.equal(2);

      var user1: DomainUser = users[0];
      expect(user1.uid).to.equal("u1");
      expect(user1.username).to.equal("test1");
      expect(user1.firstName).to.equal("test");
      expect(user1.lastName).to.equal("user");
      expect(user1.email).to.equal("test@example.com");

      var user2: DomainUser = users[1];
      expect(user2.uid).to.equal("u2");
      expect(user2.username).to.equal("test2");
      expect(user2.firstName).to.equal("test2");
      expect(user2.lastName).to.equal("user2");
      expect(user2.email).to.equal("test2@example.com");

      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });

  it('must resolve with an empty array if no users are returned', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    var req: IReceiveRequestRecord = mockServer.expectRequest(
      {t: MessageType.USER_SEARCH_REQUEST, f: [2, 3], v: "keyword"});
    mockServer.sendReplyTo(req, {t: MessageType.USER_LIST_RESPONSE, u: []});
    mockServer.start();

    var domain: ConvergenceDomain = new ConvergenceDomain(mockServer.url());
    domain.authenticateWithToken("token").then(() => {
      return domain.userService().searchUsers([UserField.FIRST_NAME, UserField.LAST_NAME], "keyword");
    }).then((users: DomainUser[]) => {
      expect(users.length).to.equal(0);
      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });

  it('must reject the promise if no fields are specified', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    mockServer.start();

    var domain: ConvergenceDomain = new ConvergenceDomain(mockServer.url());
    domain.authenticateWithToken("token").then(() => {
      return domain.userService().searchUsers([], "keyword");
    }).then((user: DomainUser[]) => {
      mockServer.doneManager().testFailure(new Error("The promise was incorrectly resolved"));
    }).catch((error: Error) => {
      mockServer.doneManager().testSuccess();
    });
  });

  it('must reject the promise if no value is specified', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    mockServer.start();

    var domain: ConvergenceDomain = new ConvergenceDomain(mockServer.url());
    domain.authenticateWithToken("token").then(() => {
      return domain.userService().searchUsers("username", null);
    }).then((user: DomainUser[]) => {
      mockServer.doneManager().testFailure(new Error("The promise was incorrectly resolved"));
    }).catch((error: Error) => {
      mockServer.doneManager().testSuccess();
    });
  });
});
