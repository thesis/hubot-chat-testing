export interface UserChatChain {
    messagesBot: (message: string, delay?: number) => MainChatChain;
    messagesRoom: (message: string, delay?: number) => MainChatChain;
}

export interface BotChatChain {
    repliesWith: (message: string) => ExtendedBotChatChain;
    replyMatches: (pattern: string | RegExp) => ExtendedBotChatChain;
    replyIncludes: (messagePart: string) => ExtendedBotChatChain;
}

export interface ExtendedBotChatChain extends MainChatChain {
    and: {
        itMatches: (pattern: string | RegExp) => ExtendedBotChatChain,
        itIncludes: (messagePart: string) => ExtendedBotChatChain
    }
}

export interface MainChatChain extends FinishingStep {
    user: (username: string) => UserChatChain;
    bot: BotChatChain;
    additionalExpectations: (f: (test: any, logger?: any) => void) => FinishingStep;
}

export interface FinishingStep {
    expect: (summary: string) => void
}

export interface FirstChatChain extends MainChatChain {
    setBrain: (f: (brain: any) => void) => MainChatChain;
}