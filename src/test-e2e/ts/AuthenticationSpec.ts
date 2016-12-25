import {MessageType} from "../../main/ts/connection/protocol/MessageType";
import {MockConvergenceServer} from "../mock-server/MockConvergenceServer";
import {DoneType} from "../mock-server/MockConvergenceServer";
import {IMockServerOptions} from "../mock-server/MockConvergenceServer";
import {IReceiveRequestRecord} from "../mock-server/records";
import Convergence from "../../main/ts/Convergence";

describe("Authentication E2E", () => {

  it("Successful password authentication", (done: MochaDone) => {
    const mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    const authExpected: any = {t: MessageType.PASSWORD_AUTH_REQUEST, u: "test", p: "password"};
    const authRequest: IReceiveRequestRecord = mockServer.expectRequest(authExpected, 200);
    mockServer.sendReplyTo(authRequest, {t: MessageType.AUTHENTICATE_RESPONSE, s: true, u: "test", p: {}});
    mockServer.start();

    Convergence.connect(mockServer.url(), "test", "password").then(domain => {
      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });

  it("Unsuccessful password authentication", (done: MochaDone) => {
    const mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    const authExpected: any = {t: MessageType.PASSWORD_AUTH_REQUEST, u: "test", p: "password"};
    const authReq: IReceiveRequestRecord = mockServer.expectRequest(authExpected, 200);
    mockServer.sendReplyTo(authReq, {t: MessageType.AUTHENTICATE_RESPONSE, s: false});
    mockServer.start();

    Convergence.connect(mockServer.url(), "test", "password").then(domain => {
      mockServer.doneManager().testFailure(new Error("Unexpected success"));
    }).catch((error: Error) => {
      mockServer.doneManager().testSuccess();
    });
  });

  //
  // Text Fixture Code
  //
  const url: string = "ws://localhost:8085/domain/namespace1/domain1";

  function expectedSuccessOptions(done: MochaDone): IMockServerOptions {
    return {
      url,
      doneType: DoneType.MOCHA,
      mochaDone: done,
      autoHandshake: true,
      handshakeTimeout: 200
    };
  }
});
