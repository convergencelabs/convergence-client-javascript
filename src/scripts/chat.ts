#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

(global as any).CONVERGENCE_DEBUG = {PROTOCOL_MESSAGES: true};

import {Chat} from "../main/";
import {connect} from "./connect";

let domain;
const chatId = "testId";

connect()
  .then(d => {
    domain = d;
    return domain.chat().create({
      id: chatId,
      type: "room",
      membership: "public",
      ignoreExistsError: true
    });
  })
  .then(channelId => {
    console.log(`Channel Created: ${channelId}`);
    return domain.chat().join(chatId);
  })
  .then((channel: Chat) => {
    console.log("Channel Joined");
    channel.send("Hello");
    channel.setName("Test Room");
    return domain.chat().get(chatId);
  })
  .then(channel => {
    console.log(channel);
  })
  .catch(e => console.error(e));
