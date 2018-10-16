#!/usr/bin/env node --require ts-node/register

import {ChatChannel} from "../main/ts/";
import {connect} from "./connect";

let domain;
const chatId = "testId";

connect()
  .then(d => {
    console.log("connected");
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
  .then((channel: ChatChannel) => {
    console.log("Channel Joined");
    channel.send("Hello");
    return domain.chat().get(chatId);
  })
  .then(channel => {
    console.log(channel);
  })
  .catch(e => console.error(e));
