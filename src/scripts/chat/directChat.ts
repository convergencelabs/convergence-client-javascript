#!/usr/bin/env npx ts-node --compiler-options {"module":"commonjs"}

import {CancellationToken, ConvergenceDomain, DirectChat} from "../../main";
import {connect} from "../connect";


const chatId = "testId";
let iterations = 1;

const cancel = new CancellationToken();
connect(cancel, false)
  .then(async (domain: ConvergenceDomain) => {
    const chats: DirectChat[] = (await domain.chat().direct([["test"], ["test2", "test3"]]));
    console.log(chats);
    const chat = chats[0];
    chat.events().subscribe(e => console.log(e));
    await chat.send("test");
  })
  .catch(e => console.error(e));
