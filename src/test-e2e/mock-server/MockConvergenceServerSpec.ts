import MessageType from "../../main/ts/protocol/MessageType";
import {MockConvergenceServer} from "./MockConvergenceServer";
import {DoneType} from "./MockConvergenceServer";
import {IMockServerOptions} from "./MockConvergenceServer";
import EqualsUtil from "../../main/ts/util/EqualsUtil";

describe('A MockConvergenceServer', () => {

  it('Should generate a failure if a handshake is not received within the timeout', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedFailureOptions(done));
    mockServer.handshake(undefined, 100);
    mockServer.autoWait();
  });

  it('Should generate a success if a handshake is received within the timeout', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    mockServer.handshake(undefined, 200);
    mockServer.autoWait();

    var socket: WebSocket = testSocket();
    socket.onopen = () => {
      socket.send(JSON.stringify({b: {t: MessageType.HANDSHAKE_REQUEST, r: false}, q: 0}));
    };
    socket.onmessage = () => {
      mockServer.doneManager().testSuccess();
    };
  });

  it('Should respond with the correct handshake, if supplied', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    var response: any = {s: true, i: "2", k: "k", c: {}, "t": MessageType.HANDSHAKE_RESPONSE};
    mockServer.handshake(response, 200);
    mockServer.autoWait();

    var socket: WebSocket = testSocket();
    socket.onopen = () => {
      socket.send(JSON.stringify({b: {t: MessageType.HANDSHAKE_REQUEST, r: false}, q: 0}));
    };
    socket.onmessage = (message: MessageEvent) => {
      var parsed: any = JSON.parse(message.data);
      if (EqualsUtil.deepEquals(parsed, {b: response, p: 0})) {
        mockServer.doneManager().testSuccess();
      } else {
        mockServer.doneManager().testFailure(new Error("incorrect handhsake response"));
      }
    };
  });


  //
  // Text Fixture Code
  //
  var url: string = "ws://localhost:8085/domain/namespace1/domain1";

  function expectedFailureOptions(done: MochaDone): IMockServerOptions {
    return {
      url: url,
      doneType: DoneType.CALLBACK,
      successCallback: function (): void {
        done(new Error("Test should have failed with a timeout, but succeeded"));
      },
      failureCallback: function (e: any): void {
        done();
      }
    };
  }

  function expectedSuccessOptions(done: MochaDone): IMockServerOptions {
    return {
      url: url,
      doneType: DoneType.MOCHA,
      mochaDone: done
    };
  }

  function testSocket(): WebSocket {
    return new WebSocket(url);
  }
});

