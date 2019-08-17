import {
  ConvergenceEventEmitter,
  ConvergenceEventListener,
  IConvergenceEvent} from "../../../main/ts/util/";
import {expect} from "chai";

describe("EventEmitter", () => {

  it("A listener registered for an event should get called when that event is emitted", () => {
    let value: number = 0;
    const emitter: TestEmitter = new TestEmitter();
    const listener: ConvergenceEventListener<TestEvent> = (e: TestEvent) => {
      value = e.value;
    };
    emitter.on("event", listener);

    emitter.next({src: this, name: "event", value: 1});

    expect(value).to.equal(1);
  });

  it("A listener is not notified after it is removed", () => {
    const emitter: TestEmitter = new TestEmitter();
    const listener: ConvergenceEventListener<TestEvent> = () => {
      throw new Error();
    };
    emitter.on("event", listener);
    emitter.off("event", listener);

    emitter.next({src: this, name: "test", value: 1});
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

    emitter.removeListeners("event1");

    emitter.next({src: this, name: "event1", value: 1});
    emitter.next({src: this, name: "event2", value: 1});

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

    emitter.removeAllListeners();

    emitter.next({src: this, name: "event1", value: 1});
    emitter.next({src: this, name: "event2", value: 1});
  });

  it("A once listener is only notified once.", () => {
    let count: number = 0;
    const emitter: TestEmitter = new TestEmitter();
    const listener: ConvergenceEventListener<TestEvent> = () => {
      count++;
    };
    emitter.once("event", listener);

    emitter.next({src: this, name: "event", value: 1});
    emitter.next({src: this, name: "event", value: 1});

    expect(count).to.equal(1);
  });

  it("A listener is only notified for events it is register to.", () => {
    let count: number = 0;
    const emitter: TestEmitter = new TestEmitter();
    const listener: ConvergenceEventListener<TestEvent> = () => {
      count++;
    };
    emitter.once("event", listener);

    emitter.next({src: this, name: "event", value: 1});
    emitter.next({src: this, name: "event1", value: 1});
    expect(count).to.equal(1);
  });

  it("Event registration is case insensitive", () => {
    let count: number = 0;
    const emitter: TestEmitter = new TestEmitter();
    const listener: ConvergenceEventListener<TestEvent> = () => {
      count++;
    };
    emitter.on("EVENT", listener);

    emitter.next({src: this, name: "event", value: 1});
    emitter.next({src: this, name: "eVeNt", value: 1});

    emitter.off("EvEnt", listener);

    emitter.next({src: this, name: "EVENT", value: 1});
    expect(count).to.equal(2);
  });

  it("Listeners can not be added multiple times", () => {
    let count: number = 0;
    const emitter: TestEmitter = new TestEmitter();
    const listener: ConvergenceEventListener<TestEvent> = () => {
      count++;
    };
    emitter.on("event", listener);
    emitter.on("event", listener);

    emitter.next({src: this, name: "event", value: 1});

    expect(count).to.equal(1);
  });
});

class TestEmitter extends ConvergenceEventEmitter<TestEvent> {

  constructor() {
    super();
  }

  public next(event: TestEvent): ConvergenceEventEmitter<TestEvent> {
    this._emitEvent(event);
    return this;
  }
}

interface TestEvent extends IConvergenceEvent {
  src: any;
  value: number;
}
