import ConvergenceDomain from "../../main/ts/ConvergenceDomain";
import {MessageType} from "../../main/ts/connection/protocol/MessageType";
import {MockConvergenceServer} from "../mock-server/MockConvergenceServer";
import {DoneType} from "../mock-server/MockConvergenceServer";
import {IMockServerOptions} from "../mock-server/MockConvergenceServer";
import {IReceiveRequestRecord} from "../mock-server/records";


describe('Authentication E2E', () => {

  it('Successful password authentication', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    var authExpected: any = {t: MessageType.PASSWORD_AUTH_REQUEST, u: "test", p: "password"};
    var authRequest: IReceiveRequestRecord = mockServer.expectRequest(authExpected, 200);
    mockServer.sendReplyTo(authRequest, {t: MessageType.AUTHENTICATE_RESPONSE, s: true, u: "test", p: {}});
    mockServer.start();

    ConvergenceDomain.connect(mockServer.url(), "test", "password").then(domain => {
      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });

  it('Unsuccessful password authentication', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    var authExpected: any = {t: MessageType.PASSWORD_AUTH_REQUEST, u: "test", p: "password"};
    var authReq: IReceiveRequestRecord = mockServer.expectRequest(authExpected, 200);
    mockServer.sendReplyTo(authReq, {t: MessageType.AUTHENTICATE_RESPONSE, s: false});
    mockServer.start();

    ConvergenceDomain.connect(mockServer.url(), "test", "password").then(domain => {
      mockServer.doneManager().testFailure(new Error("Unexpected success"));
    }).catch((error: Error) => {
      mockServer.doneManager().testSuccess();
    });
  });


  //
  // Text Fixture Code
  //
  var url: string = "ws://localhost:8085/domain/namespace1/domain1";

  function expectedSuccessOptions(done: MochaDone): IMockServerOptions {
    return {
      url: url,
      doneType: DoneType.MOCHA,
      mochaDone: done,
      autoHandshake: true,
      handshakeTimeout: 200
    };
  }
});
