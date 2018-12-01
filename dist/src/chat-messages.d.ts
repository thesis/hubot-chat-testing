export declare class ChatMessage {
    user: string;
    message: string;
    constructor(user: string, message: string);
}
export declare enum BotMessageExpectations {
    MATCH = 1,
    INCLUDE = 2,
    EQUAL = 0
}
export declare class BotMessage {
    messages: {
        expectation: string | RegExp;
        type: BotMessageExpectations;
    }[];
    replyTo: ChatMessage;
    name: string;
    constructor(message: string | RegExp, replyTo: ChatMessage, name: string, type: BotMessageExpectations);
    addExpectation(message: string | RegExp, type: BotMessageExpectations): void;
}
