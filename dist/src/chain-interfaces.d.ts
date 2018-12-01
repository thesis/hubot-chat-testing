export interface UserChatChain {
    messagesBot: (message: string) => MainChatChain;
    messagesRoom: (message: string) => MainChatChain;
}
export interface BotChatChain {
    repliesWith: (message: string) => ExtendedBotChatChain;
    replyMatches: (pattern: string | RegExp) => ExtendedBotChatChain;
    replyIncludes: (messagePart: string) => ExtendedBotChatChain;
}
export interface ExtendedBotChatChain extends MainChatChain {
    and: {
        itMatches: (pattern: string | RegExp) => ExtendedBotChatChain;
        itIncludes: (messagePart: string) => ExtendedBotChatChain;
    };
}
export interface MainChatChain {
    user: (username: string) => UserChatChain;
    bot: BotChatChain;
    expect: (summary: string) => void;
}
export interface FirstChatChain extends MainChatChain {
    setBrain: (f: (brain: any) => void) => MainChatChain;
}
