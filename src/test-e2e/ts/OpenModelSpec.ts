import {MessageType} from "../../main/ts/connection/protocol/MessageType";
import {RealTimeModel} from "../../main/ts/model/rt/RealTimeModel";
import {OpenRealTimeModelRequest} from "../../main/ts/connection/protocol/model/openRealtimeModel";
import {MockConvergenceServer} from "../mock-server/MockConvergenceServer";
import {DoneType} from "../mock-server/MockConvergenceServer";
import {IMockServerOptions} from "../mock-server/MockConvergenceServer";
import {IReceiveRequestRecord} from "../mock-server/records";
import {ModelFqn} from "../../main/ts/model/ModelFqn";
import {OpenRealTimeModelRequestSerializer} from "../../main/ts/connection/protocol/model/openRealtimeModel";
import {DataValueSerializer} from "../../main/ts/connection/protocol/model/dataValue";
import {DataValueFactory} from "../../main/ts/model/DataValueFactory";
import {Convergence} from "../../main/ts/Convergence";
import * as chai from "chai";
import ExpectStatic = Chai.ExpectStatic;

const expect: ExpectStatic = chai.expect;

describe("Open Real Time Model E2E", () => {

  it("Successful open of existing model", (done: MochaDone) => {
    let id: number = 0;
    const idGen = () => {
      return "" + id++;
    };

    const dataValueFactory: DataValueFactory = new DataValueFactory(idGen);

    const mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));

    const fqn: ModelFqn = new ModelFqn("collection", "model");

    const openRequest: OpenRealTimeModelRequest = {
      type: MessageType.OPEN_REAL_TIME_MODEL_REQUEST,
      modelFqn: fqn,
      initializerProvided: false
    };

    const expectOpen = OpenRealTimeModelRequestSerializer(openRequest);
    expectOpen.t = MessageType.OPEN_REAL_TIME_MODEL_REQUEST;
    const openReq: IReceiveRequestRecord = mockServer.expectRequest(expectOpen, 300);
    mockServer.sendReplyTo(openReq, {
      r: "1",
      v: 0,
      c: new Date().getTime(),
      m: new Date().getTime(),
      d: {
        d: DataValueSerializer(dataValueFactory.createDataValue(
          {
            num: 10,
            myDate: {
              $convergenceType: "date",
              value: "2006-01-02T15:04:05.000Z"
            }
          })),
        s: [],
        r: []
      },
      t: MessageType.OPEN_REAL_TIME_MODEL_RESPONSE
    });
    mockServer.start();

    Convergence.connectWithJwt(mockServer.url(), "token").then(domain => {
      return domain.models().open("collection", "model");
    }).then((model: RealTimeModel) => {
      expect(model.root().get("num").value()).to.equal(10);
      expect(model.root().get("myDate").value()).to.deep.equal(new Date("2006-01-02T15:04:05.000Z"));
      const expected = {
        $convergenceType: "date",
        value: "2006-01-02T15:04:05.000Z"
      };
      expect(model.root().get("myDate").toJSON()).to.deep.equal(expected);
      expect(JSON.parse(JSON.stringify(model.root().get("myDate")))).to.deep.equal(expected);
      mockServer.doneManager().testSuccess();
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
