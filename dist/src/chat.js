"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const chat_messages_1 = require("./chat-messages");
const chain_interfaces_1 = require("./chain-interfaces");
const test_worker_1 = require("./test-worker");
class Chat {
    constructor(robotName, helper, options) {
        this.context = 'The context string was not provided!';
        this.robotName = robotName;
        this.helper = helper;
        this.userMessages = [];
        this.botMessages = [];
        this.options = options;
        this.brainExpectations = new chain_interfaces_1.BrainExpectations();
    }
    startChain(context) {
        this.context = context;
        return this.firstChain();
    }
    firstChain() {
        const mainChain = this.mainChain();
        const result = {
            setBrain: (f) => {
                this.settingBrainFunction = f;
                return this.firstChain();
            },
            setRoomOptions: (roomOptions) => {
                this.roomOptions = roomOptions;
                return this.firstChain();
            },
            setEnvironmentVariables: (variables) => {
                this.environmentVariables = variables;
                return this.firstChain();
            }
        };
        return Object.assign(Object.assign({}, mainChain), result);
    }
    ;
    mainChain() {
        const brainChain = this.brainChain();
        const mainChain = {
            user: (username) => {
                return this.userChain(username);
            },
            bot: this.botChain()
        };
        return Object.assign(Object.assign({}, brainChain), mainChain);
    }
    finishingChain() {
        return {
            additionalExpectations: (f) => {
                this.additionalExpectations = f;
                return this.finishingChain();
            },
            expect: this.generateHubotTests()
        };
    }
    botChain() {
        return {
            messagesRoom: (message) => {
                const msg = `${message}`;
                const reply = this.addBotMessage(msg, chat_messages_1.BotMessageExpectations.EQUAL);
                return this.extendedBotChain(reply);
            },
            repliesWith: (message) => {
                const lastUserMessage = this.getLastUserMessage();
                const msg = `@${lastUserMessage.user} ${message}`;
                const reply = this.addBotMessage(msg, chat_messages_1.BotMessageExpectations.EQUAL);
                return this.extendedBotChain(reply);
            },
            replyMatches: (pattern) => {
                let message = typeof pattern === "string" ? new RegExp(pattern) : pattern;
                const reply = this.addBotMessage(message, chat_messages_1.BotMessageExpectations.MATCH);
                return this.extendedBotChain(reply);
            },
            replyIncludes: (messagePart) => {
                const reply = this.addBotMessage(messagePart, chat_messages_1.BotMessageExpectations.INCLUDE);
                return this.extendedBotChain(reply);
            }
        };
    }
    extendedBotChain(reply) {
        const mainChain = this.mainChain();
        const result = {
            and: {
                itMatches: (pattern) => {
                    let message = typeof pattern === "string" ? new RegExp(pattern) : pattern;
                    reply.addExpectation(message, chat_messages_1.BotMessageExpectations.MATCH);
                    return this.extendedBotChain(reply);
                },
                itIncludes: (messagePart) => {
                    reply.addExpectation(messagePart, chat_messages_1.BotMessageExpectations.INCLUDE);
                    return this.extendedBotChain(reply);
                }
            }
        };
        return Object.assign(Object.assign({}, mainChain), result);
    }
    userChain(username) {
        return {
            messagesBot: (message, delay) => {
                this.addUserMessage(username, `${this.robotName} ${message}`, delay);
                return this.mainChain();
            },
            messagesRoom: (message, delay) => {
                this.addUserMessage(username, message, delay);
                return this.mainChain();
            }
        };
    }
    brainChain() {
        const finishingStep = this.finishingChain();
        const brainExpectations = (reverted, key) => {
            return {
                includes: (obj) => {
                    this.brainExpectations.includes.push({ key, reverted, obj });
                    return this.brainChain();
                },
                equals: (obj) => {
                    this.brainExpectations.equals.push({ key, reverted, obj });
                    return this.brainChain();
                }
            };
        };
        const result = {
            brain: {
                key: (key) => {
                    return Object.assign(Object.assign({}, brainExpectations(false, key)), { not: brainExpectations(true, key) });
                },
                not: {
                    contains: (key) => {
                        this.brainExpectations.keys.push(key);
                        return this.brainChain();
                    }
                }
            }
        };
        return Object.assign(Object.assign({}, finishingStep), result);
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
    generateHubotTests() {
        const self = this;
        const context = this.context;
        return (summary) => {
            describe(context, function () {
                beforeEach(function () {
                    test_worker_1.TestWorker.prepareTest(this, self.helper, self.roomOptions);
                    this.envVariablesToClear = test_worker_1.TestWorker.setupEnvironmentVariables(this, self.environmentVariables);
                    if (self.settingBrainFunction != null) {
                        this.logger.debug(`Starting user-defined function that sets up the robot's brain...`);
                        self.settingBrainFunction(this.room.robot.brain);
                    }
                    this.logger.debug(`Adding messages for test '${context} ${summary}'. Messages:\n${JSON.stringify(self.userMessages)}`);
                    return test_worker_1.TestWorker.addUserMessages(this, self.userMessages);
                });
                afterEach(function () {
                    test_worker_1.TestWorker.finishTest(this, this.envVariablesToClear);
                });
                it(summary, function () {
                    this.logger.debug(`Running test '${context} ${summary}'. Messages in chat (${this.room.messages.length}):\n${JSON.stringify(this.room.messages)}`);
                    test_worker_1.TestWorker.performExpectations(this, self.userMessages, self.botMessages);
                    test_worker_1.TestWorker.performBrainExpectations(this, self.brainExpectations);
                    if (self.additionalExpectations != null) {
                        this.logger.debug(`Starting user-defined function with additional expectations...`);
                        self.additionalExpectations(this, this.logger);
                    }
                });
            });
        };
    }
}
exports.Chat = Chat;
