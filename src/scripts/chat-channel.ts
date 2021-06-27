#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {ChatMessageEvent, ChatRoom} from "../main/";
import {connect} from "./connect";

let domain;
const chatId = "test-channel";

connect(undefined, false)
  .then(async (d) => {
    domain = d;

    await domain.chat().create({
      id: chatId,
      type: "channel",
      membership: "public",
      ignoreExistsError: true
    });

    const channel = await domain.chat().get(chatId);

    if (!channel.isJoined()) {
      await domain.chat().join(chatId);
    }

    console.log("Chat Gotten");

    channel.events().subscribe(evt => {
      console.log(evt);
    });

    await channel.send("hello");
  })
  .catch(e => console.error(e));


function leave(room: ChatRoom): void {
  console.log(`Leaving room: ${room.info().chatId}`);
  room
    .leave()
    .then(() => {
      console.log(`Room left: ${room.info().chatId}`);
    })
    .catch(leaveError => console.error(leaveError))
}