"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SimpleMessage {
    constructor(user, message) {
        this.user = user;
        this.message = message;
    }
}
exports.SimpleMessage = SimpleMessage;
class ChatMessage extends SimpleMessage {
    constructor(user, message, delay) {
        super(user, message);
        this.delay = delay;
    }
}
exports.ChatMessage = ChatMessage;
var BotMessageExpectations;
(function (BotMessageExpectations) {
    BotMessageExpectations[BotMessageExpectations["MATCH"] = 1] = "MATCH";
    BotMessageExpectations[BotMessageExpectations["INCLUDE"] = 2] = "INCLUDE";
    BotMessageExpectations[BotMessageExpectations["EQUAL"] = 0] = "EQUAL";
})(BotMessageExpectations = exports.BotMessageExpectations || (exports.BotMessageExpectations = {}));
class BotMessage {
    constructor(message, replyTo, name, type) {
        this.messages = [{
                expectation: message,
                type: type
            }];
        this.replyTo = replyTo;
        this.name = name;
    }
    addExpectation(message, type) {
        this.messages.push({
            expectation: message,
            type: type
        });
    }
}
exports.BotMessage = BotMessage;
