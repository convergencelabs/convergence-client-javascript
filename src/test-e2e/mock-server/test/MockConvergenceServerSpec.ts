import {MessageType} from "../../../main/ts/connection/protocol/MessageType";
import {MockConvergenceServer, DoneType, IMockServerOptions} from "../MockConvergenceServer";
import {EqualsUtil} from "../../../main/ts/util/EqualsUtil";
import {ISendRecord} from "../records";

/* tslint:disable */
describe("A MockConvergenceServer", function() {
/* tslint:enable */

  let mockServer: MockConvergenceServer;
  this.timeout(20000);

  afterEach(() => {
    if (mockServer !== undefined) {
      mockServer.stop();
    }
  });

  it("Should generate a failure if a handshake is not received within the timeout", (done: MochaDone) => {
    mockServer = new MockConvergenceServer(expectedFailureOptions(done));
    mockServer.handshake(undefined, 100);
    mockServer.start();
    testSocket();
  });

  it("Should generate a success if a handshake is received within the timeout", (done: MochaDone) => {
    mockServer = new MockConvergenceServer(expectedSuccessOptions(done));
    mockServer.handshake(undefined, 200);
    mockServer.start();

    const socket: WebSocket = testSocket();
    socket.onopen = () => {
      socket.send(JSON.stringify({b: {t: MessageType.HANDSHAKE_REQUEST, r: false}, q: 0}));
    };
    socket.onmessage = () => {
      mockServer.doneManager().testSuccess();
    };
  });

  it("Should respond with the correct handshake, if supplied", (done: MochaDone) => {
    mockServer = new MockConvergenceServer(expectedSuccessOptions(done));
    const response: any = {s: true, i: "2", k: "k", c: {}, t: MessageType.HANDSHAKE_RESPONSE};
    mockServer.handshake(response, 200);
    mockServer.start();

    const socket: WebSocket = testSocket();
    socket.onopen = () => {
      socket.send(JSON.stringify({b: {t: MessageType.HANDSHAKE_REQUEST, r: false}, q: 0}));
    };
    socket.onmessage = (message: MessageEvent) => {
      const parsed: any = JSON.parse(message.data);
      if (EqualsUtil.deepEquals(parsed, {b: response, p: 0})) {
        mockServer.doneManager().testSuccess();
      } else {
        mockServer.doneManager().testFailure(new Error("incorrect handshake response"));
      }
    };
  });

  it("Should not timeout if a send is acknowledged", (done: MochaDone) => {
    mockServer =  new MockConvergenceServer(expectedSuccessOptions(done));
    const send: ISendRecord = mockServer.send({x: "y"}, 100);
    mockServer.start();

    const socket: WebSocket = testSocket();
    socket.onmessage = (message: MessageEvent) => {
      send.acknowledgeReceipt();
      mockServer.doneManager().testSuccess();
    };
  });

  it("Should timeout if a send is not acknowledged", (done: MochaDone) => {
    mockServer =  new MockConvergenceServer(expectedFailureOptions(done));
    mockServer.send({x: "y"}, 100);
    mockServer.start();

    const socket: WebSocket = testSocket();
    socket.onmessage = (message: MessageEvent) => {
      mockServer.doneManager().testSuccess();
    };
  });

  //
  // Text Fixture Code
  //
  const url: string = "ws://localhost:8085/domain/namespace1/domain1";

  function expectedFailureOptions(done: MochaDone): IMockServerOptions {
    return {
      url,
      doneType: DoneType.CALLBACK,
      successCallback: () => {
        done(new Error("Test should have failed with a timeout, but succeeded"));
      },
      failureCallback: (e: any) => {
        done();
      }
    };
  }

  function expectedSuccessOptions(done: MochaDone): IMockServerOptions {
    return {
      url,
      doneType: DoneType.MOCHA,
      mochaDone: done
    };
  }

  function testSocket(): WebSocket {
    return new WebSocket(url);
  }
});
