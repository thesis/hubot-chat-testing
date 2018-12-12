import { BotMessage, ChatMessage } from "./chat-messages";
import { BrainExpectations } from "./chain-interfaces";
export declare class TestWorker {
    static prepareTest(test: any, helper: any, roomOptions?: any): void;
    static setupEnvironmentVariables(test: any, environmentVariables?: {
        [key: string]: string;
    }): {
        [key: string]: string | undefined;
    };
    static finishTest(test: any, environmentVariables?: {
        [key: string]: string;
    }): void;
    static addUserMessages(test: any, userMessages: ChatMessage[]): any;
    static performExpectations(test: any, userMessages: ChatMessage[], botMessages: BotMessage[]): void;
    static performBrainExpectations(test: any, brainExpectations: BrainExpectations): void;
    private static performBrainContainsExpectations;
    private static performBrainObjectExpectations;
    private static createDelayForRobot;
    private static findBotRepliesToMessage;
    private static compareBotReplyWithMessage;
}
