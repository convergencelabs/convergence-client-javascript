#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {ChatMessageEvent, ChatRoom} from "../main/";
import {connect} from "./connect";

let domain;
const roomId = "test-room";

connect()
  .then(async (d) => {
    domain = d;


    await domain.chat().create({
      id: roomId,
      type: "room",
      membership: "public",
      ignoreExistsError: true
    });
    console.log(`Room exists or was created: ${roomId}`);

    const chatRoom = await domain.chat().get(roomId);
    console.log("is joined: " + chatRoom.isJoined());


    console.log("Joining joined");
    const room = await domain.chat().join(roomId);
    console.log("Room joined");

    room.events().subscribe(evt => {
      if (evt instanceof ChatMessageEvent) {
        console.log(`Message received: ${evt.message}`);
        //leave(room);
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