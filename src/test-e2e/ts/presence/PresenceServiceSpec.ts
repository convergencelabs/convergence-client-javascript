import {DoneType} from "../../mock-server/MockConvergenceServer";
import {IMockServerOptions} from "../../mock-server/MockConvergenceServer";
import ConvergenceDomain from "../../../main/ts/ConvergenceDomain";
import {MockConvergenceServer} from "../../mock-server/MockConvergenceServer";
import {MessageType} from "../../../main/ts/connection/protocol/MessageType";
import {IReceiveRequestRecord} from "../../mock-server/records";
import DomainUser from "../../../main/ts/identity/DomainUser";
import * as chai from "chai";
import ExpectStatic = Chai.ExpectStatic;
import {UserField} from "../../../main/ts/identity/IdentityService";

var expect: ExpectStatic = chai.expect;

var url: string = "ws://localhost:8085/domain/namespace1/domain1";
var expectedSuccessOptions: Function = function (done: MochaDone): IMockServerOptions {
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

describe('PresenceService.presence()', () => {

  it('must return presence info', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    var req: IReceiveRequestRecord = mockServer.expectRequest({t: MessageType.PRESENCE_REQUEST, u: ["notFound"]});
    mockServer.sendReplyTo(req, {
      t: MessageType.PRESENCE_RESPONSE, p: [{
        username: "notFound",
        available: false,
        state: {},
        clients: []
      }]
    });
    mockServer.start();

    ConvergenceDomain.connectWithToken(mockServer.url(), "token").then(domain => {
      return domain.presenceService().presence("notFound");
    }).then(userPresence => {
      expect(userPresence.username()).to.equal("notFound");
      expect(userPresence.available()).to.equal(false);
      expect(userPresence.state()).to.deep.equal({});
      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });
});

describe('PresenceService.presenceStream()', () => {
  it('must return resolve with the correct user', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    var req: IReceiveRequestRecord = mockServer.expectRequest({t: MessageType.PRESENCE_SUBSCRIBE_REQUEST, u: "u1"});
    mockServer.sendReplyTo(req, {
      t: MessageType.PRESENCE_SUBSCRIBE_RESPONSE, p: {
        username: "u1",
        available: false,
        state: {},
        clients: []
      }
    });
    mockServer.start();

    ConvergenceDomain.connectWithToken(mockServer.url(), "token").then(domain => {
      return domain.presenceService().presenceStream("u1").subscribe(userPresence => {
        expect(userPresence.username()).to.equal("u1");
        expect(userPresence.available()).to.equal(false);
        expect(userPresence.state()).to.deep.equal({});
        mockServer.doneManager().testSuccess();
      });
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });
});
