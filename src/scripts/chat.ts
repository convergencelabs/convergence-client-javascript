#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

(global as any).CONVERGENCE_DEBUG = {PROTOCOL_MESSAGES: true};

import {ChatRoom} from "../main/";
import {connect} from "./connect";

let domain;
const chatId = "testId";
let iterations = 1;

connect()
  .then(async (d) => {
    domain = d;
    while (true) {
      await joinAndLeave();
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  })
  .catch(e => console.error(e));

async function joinAndLeave() {
  console.log("Iteration " + iterations++);

  return domain.chat()
    .create({
      id: chatId,
      type: "room",
      membership: "public",
      ignoreExistsError: true
    })
    .then(channelId => {
      console.log(`Channel Created: ${channelId}`);
      return domain.chat().join(chatId);
    })
    .then((channel: ChatRoom) => {
      console.log("Channel Joined");
      return channel.leave();
    })
    .then(() => {
      console.log("Channel left");
    });
}
