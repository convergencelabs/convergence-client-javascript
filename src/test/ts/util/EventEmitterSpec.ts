import * as chai from "chai";
import {EventEmitter, SimpleEventListener} from "../../../main/ts/util/EventEmitter";
import ExpectStatic = Chai.ExpectStatic;

const expect: ExpectStatic = chai.expect;

describe("EventEmitter", () => {

  it("A listener registered for an event should get called when that event is emitted", () => {
    let value: number = 0;
    const emitter: TestEmitter = new TestEmitter();
    const listener: SimpleEventListener = (v: number) => {
      value = v;
    };
    emitter.on("event", listener);

    emitter.emit("event", 1);

    expect(value).to.equal(1);
  });

  it("A listener is not notified after it is removed", () => {
    const emitter: TestEmitter = new TestEmitter();
    const listener: SimpleEventListener = (v: number) => {
      throw new Error();
    };
    emitter.on("event", listener);
    emitter.off("event", listener);

    emitter.emit("event", 1);
  });

  it("All listeners for an event are not notified after all listeners are removed for that event", () => {
    let count: number = 0;
    const emitter: TestEmitter = new TestEmitter();

    emitter.on("event1", () => {
      throw new Error();
    });
    emitter.on("event1", () => {
      throw new Error();
    });

    emitter.on("event2", () => {
      count++;
    });

    emitter.removeAllListeners("event1");

    emitter.emit("event1");
    emitter.emit("event2");

    expect(count).to.equal(1);
  });

  it("No listeners are notified after all listeners are removed", () => {
    const emitter: TestEmitter = new TestEmitter();

    emitter.on("event1", () => {
      throw new Error();
    });
    emitter.on("event2", () => {
      throw new Error();
    });

    emitter.removeAllListenersForAllEvents();

    emitter.emit("event1");
    emitter.emit("event2");
  });

  it("A once listener is only notified once.", () => {
    let count: number = 0;
    const emitter: TestEmitter = new TestEmitter();
    const listener: SimpleEventListener = (v: number) => {
      count++;
    };
    emitter.once("event", listener);

    emitter.emit("event");
    emitter.emit("event");
    expect(count).to.equal(1);
  });

  it("A listener is only notified for events it is register to.", () => {
    let count: number = 0;
    const emitter: TestEmitter = new TestEmitter();
    const listener: SimpleEventListener = (v: number) => {
      count++;
    };
    emitter.once("event", listener);

    emitter.emit("event");
    emitter.emit("event1");
    expect(count).to.equal(1);
  });

  it("Event registration is case insensitive", () => {
    let count: number = 0;
    const emitter: TestEmitter = new TestEmitter();
    const listener: SimpleEventListener = (v: number) => {
      count++;
    };
    emitter.on("EVENT", listener);

    emitter.emit("event");
    emitter.emit("eVeNt");

    emitter.off("EvEnt", listener);

    emitter.emit("EVENT");
    expect(count).to.equal(2);
  });

  it("The correct listener count is returned for events with at least one listener", () => {
    const emitter: TestEmitter = new TestEmitter();
    emitter.on("event1", () => {/* noop */
    });
    emitter.on("event1", () => {/* noop */
    });
    emitter.on("event2", () => {/* noop */
    });

    expect(emitter.listenerCount("event1")).to.equal(2);
    expect(emitter.listenerCount("event2")).to.equal(1);
  });

  it("The correct listener count is returned for events with at no listeners", () => {
    const emitter: TestEmitter = new TestEmitter();
    expect(emitter.listenerCount("event1")).to.equal(0);
  });

  it("The correct listeners are returned for events with at least one listener", () => {
    const emitter: TestEmitter = new TestEmitter();
    emitter.on("event1", () => {/* noop */
    });
    emitter.on("event1", () => {/* noop */
    });
    emitter.on("event2", () => {/* noop */
    });

    expect(emitter.listeners("event1").length).to.equal(2);
    expect(emitter.listeners("event2").length).to.equal(1);
  });

  it("An empty array is returned for an event with no listeners", () => {
    const emitter: TestEmitter = new TestEmitter();
    expect(emitter.listeners("event1")).to.deep.equal([]);
  });

  it("Listeners can not be added multiple times", () => {
    let count: number = 0;
    const emitter: TestEmitter = new TestEmitter();
    const listener: SimpleEventListener = () => {
      count++;
    };
    emitter.on("event", listener);
    emitter.on("event", listener);

    emitter.emit("event");

    expect(count).to.equal(1);
  });

  it("Max listeners can not be exceeded", () => {
    const emitter: TestEmitter = new TestEmitter();
    emitter.setMaxListeners(1);
    emitter.on("event", () => {
      // noop
    });

    expect(() => emitter.on("event", () => {
      // noop
    })).to.throw(Error);
  });

  it("Max listeners must be set to the default when constructed", () => {
    const emitter: TestEmitter = new TestEmitter();
    expect(emitter.getMaxListeners()).to.equal(TestEmitter.defaultMaxListeners);
  });
});

class TestEmitter extends EventEmitter {
  public emit(event: string, value?: any): EventEmitter {
    super.emit(event, value);
    return this;
  }
}
