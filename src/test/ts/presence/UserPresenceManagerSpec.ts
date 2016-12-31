import {Subject} from "rxjs/Rx";

import * as chai from "chai";
import ExpectStatic = Chai.ExpectStatic;
import {UserPresenceImpl} from "../../../main/ts/presence/UserPresenceImpl";
import {UserPresenceManager} from "../../../main/ts/presence/UserPresenceManager";
import {MessageEvent} from "../../../main/ts/connection/ConvergenceConnection";

const expect: ExpectStatic = chai.expect;

const noOp: () => void = () => { return; };

describe("UserPresenceManager", () => {

  it("initial presence set correctly", () => {
    const state = new Map<string, any>();
    state.set("key", 9);

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", true, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    expect(mgr.username()).to.equal(initialPresence.username());
    expect(mgr.isAvailable()).to.equal(initialPresence.isAvailable());
    expect(mgr.state().size).to.equal(1);
    expect(mgr.state().get("key")).to.equal(9);
    expect(mgr.state("key")).to.equal(9);
  });

  it("availability is set properly", () => {
    const state = new Map<string, any>();
    state.set("key", 9);

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", false, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    mgr.availability(true);

    expect(mgr.isAvailable()).to.equal(true);
  });

  it("new state is merged properly", () => {
    const state = new Map<string, any>();
    state.set("key1", "value1");
    state.set("key2", "value2");

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", false, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    const add = new Map<string, any>();
    add.set("key2", "2");
    add.set("key3", "3");
    mgr.set(add);

    expect(mgr.state().size).to.equal(3);
    expect(mgr.state("key1")).to.equal("value1");
    expect(mgr.state("key2")).to.equal("2");
    expect(mgr.state("key3")).to.equal("3");
  });

  it("new state is removed properly", () => {
    const state = new Map<string, any>();
    state.set("key1", "value1");
    state.set("key2", "value2");
    state.set("key3", "value3");

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", false, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    mgr.remove(["key1", "key2"]);

    expect(mgr.state().size).to.equal(1);
    expect(mgr.state("key3")).to.equal("value3");
  });

  it("new state is cleared properly", () => {
    const state = new Map<string, any>();
    state.set("key1", "value1");
    state.set("key2", "value2");
    state.set("key3", "value3");

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", false, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    mgr.clear();

    expect(mgr.state().size).to.equal(0);
  });

  it("set fires the proper event", () => {
    const state = new Map<string, any>();

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", false, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    let firedEvent: number = 0;
    mgr.on("state_set", (e) => {
      firedEvent++;
      expect(e.name).to.equal("state_set");
      expect(e.username).to.equal(initialPresence.username());
      expect(e.state.size).to.equal(1);
      expect(e.state.get("key")).to.equal("value");
    });

    let firedObserver: number = 0;
    mgr.events().filter(e => e.name === "state_set").subscribe((e) => {
      firedObserver++;
    });

    const add = new Map<string, any>();
    add.set("key", "value");
    mgr.set(add);

    expect(firedEvent).to.equal(1);
    expect(firedObserver).to.equal(1);
  });

  it("clear fires the proper event", () => {
    const state = new Map<string, any>();

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", false, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    let firedEvent: number = 0;
    mgr.on("state_cleared", (e) => {
      expect(e.name).to.equal("state_cleared");
      expect(e.username).to.equal(initialPresence.username());
      firedEvent++;
    });

    let firedObserver: number = 0;
    mgr.events().filter(e => e.name === "state_cleared").subscribe((e) => {
      firedObserver++;
    });

    mgr.clear();

    expect(firedEvent).to.equal(1);
    expect(firedObserver).to.equal(1);
  });

  it("remove fires the proper event", () => {
    const state = new Map<string, any>();

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", false, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    let firedEvent: number = 0;
    mgr.on("state_removed", (e) => {
      firedEvent++;
      expect(e.username).to.equal(initialPresence.username());
      expect(e.name).to.equal("state_removed");
      expect(e.keys).to.deep.equal(["k1", "k2"]);
    });

    let firedObserver: number = 0;
    mgr.events().filter(e => e.name === "state_removed").subscribe((e) => {
      firedObserver++;
    });

    mgr.remove(["k1", "k2"]);

    expect(firedEvent).to.equal(1);
    expect(firedObserver).to.equal(1);
  });

  it("subscription has correct state", () => {
    const state = new Map<string, any>();
    state.set("key", 9);

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", false, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    const s = mgr.subscribe();

    expect(s.username()).to.equal(initialPresence.username());
    expect(s.isAvailable()).to.equal(initialPresence.isAvailable());
    expect(s.state().size).to.equal(1);
    expect(s.state().get("key")).to.equal(9);
    expect(s.state("key")).to.equal(9);
  });

  it("unsubscribe correctly called", () => {
    const state = new Map<string, any>();

    let called: number = 0;

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", false, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), (username) => {
      called++;
      expect(username).to.equal(initialPresence.username());
    });

    const s1 = mgr.subscribe();
    const s2 = mgr.subscribe();

    s1.unsubscribe();
    expect(called).to.equal(0);

    s2.unsubscribe();
    expect(called).to.equal(1);

    s2.unsubscribe();
  });
});
