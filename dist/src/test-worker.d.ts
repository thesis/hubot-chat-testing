import { BotMessage, ChatMessage } from "./chat-messages";
export declare class TestWorker {
    static prepareTest(test: any, helper: any): void;
    static finishTest(test: any): void;
    static addUserMessages(test: any, userMessages: ChatMessage[]): any;
    static performExpectations(test: any, userMessages: ChatMessage[], botMessages: BotMessage[]): void;
    private static createDelayForRobot;
    private static findBotRepliesToMessage;
    private static compareBotReplyWithMessage;
}
