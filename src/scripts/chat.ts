#!/usr/bin/env node --require ts-node/register

import Convergence, {ChatChannel} from "../main/ts/";
import * as WebSocket from "ws";
import {DOMAIN_PASSWORD, DOMAIN_URL, DOMAIN_USERNAME} from "./config";

let domain;
const chatId = "testId";

Convergence
  .connect(DOMAIN_URL, DOMAIN_USERNAME, DOMAIN_PASSWORD, {
    webSocketFactory: (u) => new WebSocket(u, {rejectUnauthorized: false}),
    webSocketClass: WebSocket,
    retryOnOpen: false
  })
  .then(d => {
    console.log("connected");
    domain = d;
    return domain.chat().create({
      id: chatId,
      type: "room",
      membership: "public",
      ignoreExistsError: true});
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
