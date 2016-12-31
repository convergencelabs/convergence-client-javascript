import {MessageType} from "../../main/ts/connection/protocol/MessageType";
import {RealTimeModel} from "../../main/ts/model/rt/RealTimeModel";
import {MockConvergenceServer} from "../mock-server/MockConvergenceServer";
import {DoneType} from "../mock-server/MockConvergenceServer";
import {IMockServerOptions} from "../mock-server/MockConvergenceServer";
import {IReceiveRequestRecord, ISendRecord} from "../mock-server/records";
import {RealTimeString} from "../../main/ts/model/rt/RealTimeString";
import {debugFlags} from "../../main/ts/Debug";
import {RemoteReferenceCreatedEvent} from "../../main/ts/model/modelEvents";
import {Convergence} from "../../main/ts/Convergence";

describe("Reference Transformation E2E", () => {

  it("Successful open of existing model", (done: MochaDone) => {
    debugFlags.socket.messages = true;

    const resourceId = "1";
    const remoteSessionId = "u1:02";

    const mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));

    const expectedOpen: any = {t: MessageType.OPEN_REAL_TIME_MODEL_REQUEST, c: "collection", m: "model", i: false};
    const openReq: IReceiveRequestRecord = mockServer.expectRequest(expectedOpen, 300);
    mockServer.sendReplyTo(openReq, {
      r: resourceId,
      v: 0,
      c: new Date().getTime(),
      m: new Date().getTime(),
      d: {
        d: {
          i: "0:0",
          "?": 0,
          c: {
            text: {
              i: "0:1",
              "?": 2,
              v: "Some example text to test with."
            }
          }
        },
        s: [remoteSessionId],
        r: []
      },
      t: MessageType.OPEN_REAL_TIME_MODEL_RESPONSE
    });

    const refPublishAction = mockServer.send({
      r: resourceId,
      s: remoteSessionId,
      d: "0:1",
      k: "testKey",
      c: 0,
      t: MessageType.REFERENCE_PUBLISHED
    });

    const expectOp: any = {
      r: "1",
      s: 0,
      v: 0,
      o: {
        t: 13,
        d: "0:1",
        n: false,
        i: 0,
        v: "x"
      },
      t: MessageType.OPERATION_SUBMISSION
    };
    mockServer.expect(expectOp, 300);

    const referenceSetAction: ISendRecord = mockServer.send({
      r: resourceId,
      s: remoteSessionId,
      k: "testKey",
      d: "0:1",
      c: 0,
      v: [10],
      t: MessageType.REFERENCE_SET
    }, 300);

    mockServer.start();

    Convergence.connectWithJwt(mockServer.url(), "token").then(domain => {
      return domain.models().open("collection", "model");
    }).then((model: RealTimeModel) => {
      referenceSetAction.acknowledgeReceipt();
      const rts: RealTimeString = <RealTimeString> model.elementAt("text");

      rts.on(RealTimeString.Events.REFERENCE, (e: RemoteReferenceCreatedEvent) => {
        console.log(e.reference.username());
        refPublishAction.acknowledgeReceipt();
        e.reference.on("set", (evt) => {
          referenceSetAction.acknowledgeReceipt();
          console.log(e.src.value());
          mockServer.doneManager().testSuccess();
        });
      });

      rts.insert(0, "x");
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
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
      handshakeTimeout: 200,

      autoTokenAuth: true,
      authExpectedToken: "token"
    };
  }
});
