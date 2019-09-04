import { IdentityCache } from "../identity/IdentityCache";
import {io} from "@convergence-internal/convergence-proto";
import IChatInfoData = io.convergence.proto.IChatInfoData;
import { ChatMembership } from "./MembershipChat";
import { protoToDomainUserId, getOrDefaultNumber, timestampToDate } from "../connection/ProtocolUtil";
import { ConvergenceSession } from "../ConvergenceSession";
import { DomainUser } from "../identity";

export interface ChatInfo {
  readonly chatType: ChatType;
  readonly chatId: string;
  readonly membership: ChatMembership;
  readonly name: string;
  readonly topic: string;
  readonly createdTime: Date;
  readonly lastEventTime: Date;
  readonly lastEventNumber: number;
  readonly maxSeenEventNumber: number;
  readonly members: ChatMember[];
}

export interface ChatMember {
  readonly user: DomainUser;
  readonly maxSeenEventNumber: number;
}
export type ChatType = "direct" | "channel" | "room";

export const ChatTypes = {
  DIRECT: "direct",
  CHANNEL: "channel",
  ROOM: "room"
};

/**
 * @hidden
 * @internal
 */
export function createChatInfo(session: ConvergenceSession,
                               identityCache: IdentityCache,
                               chatData: IChatInfoData): ChatInfo {
  let maxEvent = -1;
  const localUserId = session.user().userId;
  const members = chatData.members.map(member => {
    const userId = protoToDomainUserId(member.user);
    if (userId.equals(localUserId)) {
      maxEvent = getOrDefaultNumber(member.maxSeenEventNumber);
    }

    const user = identityCache.getUser(userId);

    return {user, maxSeenEventNumber: getOrDefaultNumber(member.maxSeenEventNumber)};
  });
  return {
    chatId: chatData.id,
    chatType: chatData.chatType as ChatType,
    membership: chatData.membership as ChatMembership,
    name: chatData.name,
    topic: chatData.topic,
    createdTime: timestampToDate(chatData.createdTime),
    lastEventTime: timestampToDate(chatData.lastEventTime),
    lastEventNumber: getOrDefaultNumber(chatData.lastEventNumber),
    maxSeenEventNumber: maxEvent,
    members
  };
}
