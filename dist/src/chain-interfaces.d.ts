export interface UserChatChain {
    messagesBot: (message: string, delay?: number) => MainChatChain;
    messagesRoom: (message: string, delay?: number) => MainChatChain;
}
export interface BotChatChain {
    repliesWith: (message: string) => ExtendedBotChatChain;
    messagesRoom: (message: string) => ExtendedBotChatChain;
    replyMatches: (pattern: string | RegExp) => ExtendedBotChatChain;
    replyIncludes: (messagePart: string) => ExtendedBotChatChain;
}
export interface ExtendedBotChatChain extends MainChatChain {
    and: {
        itMatches: (pattern: string | RegExp) => ExtendedBotChatChain;
        itIncludes: (messagePart: string) => ExtendedBotChatChain;
    };
}
export interface MainChatChain extends FinishingStep {
    user: (username: string) => UserChatChain;
    bot: BotChatChain;
    brain: BrainChain;
}
export interface FinishingStep {
    additionalExpectations: (f: (test: any, logger?: any) => void) => FinishingStep;
    expect: (summary: string) => void;
}
export interface FirstChatChain extends MainChatChain {
    setRoomOptions: (options: any) => FirstChatChain;
    setBrain: (f: (brain: any) => void) => FirstChatChain;
}
export interface BrainChain {
    includes: (key: string, obj: any) => ExtendedBrainChain;
}
export interface ExtendedBrainChain extends FinishingStep {
    and: {
        itIncludes: (key: string, obj: any) => ExtendedBrainChain;
    };
}
