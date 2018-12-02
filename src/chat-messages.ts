export class SimpleMessage {
    user: string;
    message: string;

    constructor(user: string, message: string){
        this.user = user;
        this.message = message;
    }
}

export class ChatMessage extends SimpleMessage{
    delay: number;

    constructor(user: string, message: string, delay: number){
        super(user, message);
        this.delay = delay;
    }
}

export enum BotMessageExpectations {
    MATCH = 1,
    INCLUDE = 2,
    EQUAL = 0
}

export class BotMessage {
    messages: {expectation: string | RegExp, type: BotMessageExpectations}[];
    replyTo: ChatMessage;
    name: string;

    constructor(message: string | RegExp, replyTo: ChatMessage, name: string, type: BotMessageExpectations){
        this.messages = [{
            expectation: message,
            type: type
        }];
        this.replyTo = replyTo;
        this.name = name;
    }

    addExpectation(message: string | RegExp, type: BotMessageExpectations){
        this.messages.push({
            expectation: message,
            type: type
        })
    }
}