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
export interface MainChatChain extends BrainChain {
    user: (username: string) => UserChatChain;
    bot: BotChatChain;
}
export interface FinishingStep {
    additionalExpectations: (f: (test: any, logger?: any) => void) => FinishingStep;
    expect: (summary: string) => void;
}
export interface FirstChatChain extends MainChatChain {
    setRoomOptions: (options: any) => FirstChatChain;
    setBrain: (f: (brain: any) => void) => FirstChatChain;
    setEnvironmentVariables: (variables: {
        [key: string]: string;
    }) => FirstChatChain;
}
export interface BrainChain extends FinishingStep {
    brain: {
        key: (key: string) => BrainChainExpectations;
        not: {
            contains: (key: string) => BrainChain;
        };
    };
}
export interface BrainChainExpectationsActions {
    includes: (obj: any) => BrainChain;
    equals: (obj: any) => BrainChain;
}
export interface BrainChainExpectations extends BrainChainExpectationsActions {
    not: BrainChainExpectationsActions;
}
export declare class BrainExpectations {
    equals: {
        key: string;
        reverted: boolean;
        obj: any;
    }[];
    includes: {
        key: string;
        reverted: boolean;
        obj: any;
    }[];
    keys: string[];
}
