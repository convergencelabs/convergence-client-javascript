#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {ChatMessageEvent, ChatRoom} from "../main/";
import {connect} from "./connect";

let domain;
const chatId = "testId";

connect()
  .then(async (d) => {
    domain = d;

    const roomId = await domain.chat().create({
      id: chatId,
      type: "room",
      membership: "public",
      ignoreExistsError: true
    });

    console.log(`Room exists or was created: ${roomId}`);

    const room = await domain.chat().join(chatId);

    console.log("Room Joined");

    room.events().subscribe(evt => {
      if (evt instanceof ChatMessageEvent) {
        console.log(`Message received: ${evt.message}`);
        leave(room);
      }
    });

    await room.send("hello");
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