"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chat_messages_1 = require("./chat-messages");
const test_worker_1 = require("./test-worker");
class Chat {
    constructor(robotName = 'hubot', helper, options) {
        this.settingBrainFunction = undefined;
        this.additionalExpectations = undefined;
        this.context = 'The context string was not provided!';
        this.robotName = robotName;
        this.helper = helper;
        this.userMessages = [];
        this.botMessages = [];
        this.options = options;
    }
    startChain(context) {
        const self = this;
        const mainChain = this.mainChatChain();
        this.context = context;
        return {
            user: mainChain.user,
            bot: mainChain.bot,
            expect: mainChain.expect,
            setBrain: function (f) {
                self.settingBrainFunction = f;
                return mainChain;
            }
        };
    }
    mainChatChain() {
        const self = this;
        return {
            user: function (username) {
                return self.userPossibilities(username);
            },
            bot: self.botPossibilities(),
            expect: self.generateHubotTests(self.context)
        };
    }
    extendedBotChain(reply) {
        const self = this;
        const mainChain = this.mainChatChain();
        return {
            bot: mainChain.bot,
            user: mainChain.user,
            and: self.generateBotAndChain(reply),
            expect: mainChain.expect
        };
    }
    generateBotAndChain(reply) {
        const self = this;
        return {
            itMatches: function (pattern) {
                let message = typeof pattern === "string" ? new RegExp(pattern) : pattern;
                reply.addExpectation(message, chat_messages_1.BotMessageExpectations.MATCH);
                return self.extendedBotChain(reply);
            },
            itIncludes: function (messagePart) {
                reply.addExpectation(messagePart, chat_messages_1.BotMessageExpectations.INCLUDE);
                return self.extendedBotChain(reply);
            }
        };
    }
    botPossibilities() {
        const self = this;
        return {
            repliesWith: function (message) {
                const lastUserMessage = self.getLastUserMessage();
                const msg = `@${lastUserMessage.user} ${message}`;
                const reply = self.addBotMessage(msg, chat_messages_1.BotMessageExpectations.EQUAL);
                return self.extendedBotChain(reply);
            },
            replyMatches: function (pattern) {
                let message = typeof pattern === "string" ? new RegExp(pattern) : pattern;
                const reply = self.addBotMessage(message, chat_messages_1.BotMessageExpectations.MATCH);
                return self.extendedBotChain(reply);
            },
            replyIncludes: function (messagePart) {
                const reply = self.addBotMessage(messagePart, chat_messages_1.BotMessageExpectations.INCLUDE);
                return self.extendedBotChain(reply);
            }
        };
    }
    userPossibilities(username) {
        const self = this;
        return {
            messagesBot: function (message, delay) {
                self.addUserMessage(username, `${self.robotName} ${message}`, delay);
                return self.mainChatChain();
            },
            messagesRoom: function (message, delay) {
                self.addUserMessage(username, message, delay);
                return self.mainChatChain();
            }
        };
    }
    addUserMessage(username, message, delay) {
        const botDelay = delay || this.options.answerDelay;
        const msg = new chat_messages_1.ChatMessage(username, message, botDelay);
        this.userMessages.push(msg);
        return msg;
    }
    addBotMessage(message, type) {
        const lastUserMessage = this.getLastUserMessage();
        const reply = new chat_messages_1.BotMessage(message, lastUserMessage, this.robotName, type);
        this.botMessages.push(reply);
        return reply;
    }
    getLastUserMessage() {
        return this.userMessages[this.userMessages.length - 1];
    }
    generateHubotTests(context) {
        const self = this;
        return function (summary) {
            describe(context, function () {
                beforeEach(function () {
                    test_worker_1.TestWorker.prepareTest(this, self.helper);
                    if (self.settingBrainFunction != null) {
                        this.logger.debug(`Starting user-defined function that sets up the robot's brain...`);
                        self.settingBrainFunction(this.room.robot.brain);
                    }
                    this.logger.debug(`Adding messages for test '${context} ${summary}'. Messages:\n${JSON.stringify(self.userMessages)}`);
                    return test_worker_1.TestWorker.addUserMessages(this, self.userMessages);
                });
                afterEach(function () {
                    test_worker_1.TestWorker.finishTest(this);
                });
                it(summary, function () {
                    this.logger.debug(`Running test '${context} ${summary}'. Messages in chat (${this.room.messages.length}):\n${JSON.stringify(this.room.messages)}`);
                    test_worker_1.TestWorker.performExpectations(this, self.userMessages, self.botMessages);
                    if (self.additionalExpectations != null) {
                        this.logger.debug(`Starting user-defined function with additional expectations...`);
                        self.additionalExpectations(this);
                    }
                });
            });
        };
    }
}
exports.Chat = Chat;
