import {expect} from "chai";
import {ConvergenceDomain, IConvergenceOptions} from "../../main/ts";
import * as WebSocket from "ws";

const OPTIONS: IConvergenceOptions = {
  webSocket: {
    factory: (u) => new WebSocket(u, {rejectUnauthorized: false}),
    class: WebSocket
  }
};

describe("ConvergenceDomain", () => {
  it("Is not disposed after construction", () => {
   const domain = new ConvergenceDomain("wss://localhost/namespace/domain", OPTIONS);
   expect(domain.isDisposed()).to.be.false;
  });

  it("Accepts valid http url", () => {
    new ConvergenceDomain("http://localhost/namespace/domain", OPTIONS);
  });

  it("Accepts valid https url", () => {
    new ConvergenceDomain("https://localhost/namespace/domain", OPTIONS);
  });

  it("Accepts valid ws url", () => {
    new ConvergenceDomain("ws://localhost/namespace/domain", OPTIONS);
  });

  it("Accepts valid wss url", () => {
    new ConvergenceDomain("wss://localhost/namespace/domain", OPTIONS);
  });

  it("Accepts a url with context path", () => {
    new ConvergenceDomain("wss://localhost/a/b/namespace/domain", OPTIONS);
  });

  it("Accepts a url with a port", () => {
    new ConvergenceDomain("wss://localhost:8000/namespace/domain", OPTIONS);
  });

  it("Rejects a url with a only one segment", () => {
    expect(() => new ConvergenceDomain("wss://localhost/namespace/", OPTIONS)).to.throw();
  });

  it("Rejects a url with a no namespace or domain", () => {
    expect(() => new ConvergenceDomain("wss://localhost/", OPTIONS)).to.throw();
  });
});
