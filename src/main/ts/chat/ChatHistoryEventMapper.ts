import {io} from "@convergence/convergence-proto";
import IChatChannelEventData = io.convergence.proto.IChatChannelEventData;
import {ChatHistoryEntry} from "./ChatHistoryEntry";

export class ChatHistoryEventMapper {
  public static toChatHistoryEntry(data: IChatChannelEventData): ChatHistoryEntry {
    return;
  }
}
