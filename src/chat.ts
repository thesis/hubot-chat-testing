import {BotMessage, BotMessageExpectations, ChatMessage} from "./chat-messages";
import {
    BotChatChain,
    BrainChain,
    ExtendedBotChatChain, ExtendedBrainChain,
    FirstChatChain,
    MainChatChain,
    UserChatChain,
    FinishingStep
} from "./chain-interfaces";
import {TestWorker} from "./test-worker";
import {HubotChatOptions} from "./options";

export class Chat {
    readonly userMessages: ChatMessage[];
    readonly botMessages: BotMessage[];
    private settingBrainFunction?: ((brain: any) => void) | undefined;
    private additionalExpectations?: ((test: any, logger?: any) => void);
    private context: string = 'The context string was not provided!';
    private readonly robotName: string;
    private readonly helper: any;
    private roomOptions?: any;
    private options: HubotChatOptions;
    private readonly brainExpectations: any;
    
    constructor(robotName: string = 'hubot', helper: any, options: HubotChatOptions){
        this.robotName = robotName;
        this.helper = helper;
        this.userMessages = [];
        this.botMessages = [];
        this.options = options;
        this.brainExpectations = {};
    }

    startChain(context: string) : FirstChatChain {
        const self: Chat = this;
        const mainChain : MainChatChain = this.mainChatChain();
        this.context = context;

        return {
            user: mainChain.user,
            bot: mainChain.bot,
            expect: mainChain.expect,
            setBrain: function(f: (brain: any) => void){
                self.settingBrainFunction = f;
                return self.startChain(context);
            },
            setRoomOptions: function(roomOptions: any){
                self.roomOptions = roomOptions;
                return self.startChain(context);
            },
            brain: mainChain.brain,
            additionalExpectations: mainChain.additionalExpectations
        };
    }

    private generateFinishingSteps(context: string) : FinishingStep {
        const self: Chat = this;
        const expect = this.generateHubotTests(context);
        return {
            additionalExpectations: function(f: (test: any, logger: any) => void){
                self.additionalExpectations = f;
                return self.generateFinishingSteps(context);
            },
            expect
        }
    }

    private mainChatChain(): MainChatChain {
        const self: Chat = this;
        const finishingStep: FinishingStep = this.generateFinishingSteps(this.context);
        return {
            user: function(username: string){
                return self.userPossibilities(username);
            },
            bot: self.botPossibilities(),
            additionalExpectations: finishingStep.additionalExpectations,
            expect: finishingStep.expect,
            brain: self.generateBrainChain()
        }
    }

    private extendedBotChain(reply: BotMessage) : ExtendedBotChatChain {
        const self: Chat = this;
        const mainChain : MainChatChain = this.mainChatChain();
        return {
            bot: mainChain.bot,
            user: mainChain.user,
            and: self.generateBotAndChain(reply),
            expect: mainChain.expect,
            additionalExpectations: mainChain.additionalExpectations,
            brain: mainChain.brain
        };
    }

    private generateBotAndChain(reply: BotMessage) {
        const self: Chat = this;
        return {
            itMatches: function(pattern: string | RegExp) : ExtendedBotChatChain {
                let message: RegExp = typeof pattern === "string" ? new RegExp(pattern) : pattern;
                reply.addExpectation(message, BotMessageExpectations.MATCH);
                return self.extendedBotChain(reply);
            },
            itIncludes: function(messagePart: string): ExtendedBotChatChain {
                reply.addExpectation(messagePart, BotMessageExpectations.INCLUDE);
                return self.extendedBotChain(reply);
            }
        };
    }

    private generateBrainChain() : BrainChain {
        const self: Chat = this;
        return {
            includes: function(key: string, object: any) : ExtendedBrainChain {
                self.brainExpectations[key] = object;
                return self.generateExtendedBrainChain();
            }
        }
    }

    private generateExtendedBrainChain(): ExtendedBrainChain {
        const finishingStep: FinishingStep = this.generateFinishingSteps(this.context);
        const self: Chat = this;
        return {
            and: {
                itIncludes: function(key: string, object: any) : ExtendedBrainChain {
                    self.brainExpectations[key] = object;
                    return self.generateExtendedBrainChain();
                }
            },
            additionalExpectations: finishingStep.additionalExpectations,
            expect: finishingStep.expect,
        }
    }

    private botPossibilities(): BotChatChain {
        const self: Chat = this;
        return {
            messagesRoom: function(message: string) : ExtendedBotChatChain {
                const msg = `${message}`;
                const reply = self.addBotMessage(msg, BotMessageExpectations.EQUAL);
                return self.extendedBotChain(reply);
            },
            repliesWith: function(message: string) : ExtendedBotChatChain {
                const lastUserMessage = self.getLastUserMessage();
                const msg = `@${lastUserMessage.user} ${message}`;
                const reply = self.addBotMessage(msg, BotMessageExpectations.EQUAL);
                return self.extendedBotChain(reply);
            },
            replyMatches: function(pattern: string | RegExp) : ExtendedBotChatChain {
                let message: RegExp = typeof pattern === "string" ? new RegExp(pattern) : pattern;
                const reply = self.addBotMessage(message, BotMessageExpectations.MATCH);
                return self.extendedBotChain(reply);
            },
            replyIncludes: function(messagePart: string): ExtendedBotChatChain {
                const reply = self.addBotMessage(messagePart, BotMessageExpectations.INCLUDE);
                return self.extendedBotChain(reply);
            }
        };
    }

    private userPossibilities(username: string) : UserChatChain{
        const self: Chat = this;
        return {
            messagesBot: function(message: string, delay?: number){
                self.addUserMessage(username, `${self.robotName} ${message}`, delay);
                return self.mainChatChain();
            },
            messagesRoom: function(message: string, delay?: number){
                self.addUserMessage(username, message, delay);
                return self.mainChatChain();
            }
        }
    }

    private addUserMessage(username: string, message: string, delay?: number) : ChatMessage{
        const botDelay = delay || this.options.answerDelay;
        const msg: ChatMessage = new ChatMessage(username, message, botDelay);
        this.userMessages.push(msg);
        return msg;
    }

    private addBotMessage(message: string | RegExp, type: BotMessageExpectations) : BotMessage{
        const lastUserMessage = this.getLastUserMessage();
        const reply: BotMessage = new BotMessage(message, lastUserMessage, this.robotName, type);
        this.botMessages.push(reply);
        return reply;
    }

    private getLastUserMessage(): ChatMessage {
        return this.userMessages[this.userMessages.length - 1];
    }

    private generateHubotTests(context: string) {
        const self: Chat = this;
        return function(summary: string) : void {
            describe(context, function() {
                beforeEach(function() {
                    TestWorker.prepareTest(this, self.helper, self.roomOptions);
                    if(self.settingBrainFunction != null){
                        this.logger.debug(`Starting user-defined function that sets up the robot's brain...`);
                        self.settingBrainFunction(this.room.robot.brain);
                    }
                    this.logger.debug(`Adding messages for test '${context} ${summary}'. Messages:\n${JSON.stringify(self.userMessages)}`);
                    return TestWorker.addUserMessages(this, self.userMessages);
                });

                afterEach(function() {
                    TestWorker.finishTest(this);
                });

                it(summary, function() {
                    this.logger.debug(`Running test '${context} ${summary}'. Messages in chat (${this.room.messages.length}):\n${JSON.stringify(this.room.messages)}`);
                    TestWorker.performExpectations(this, self.userMessages, self.botMessages);
                    TestWorker.performBrainExpectations(this, self.brainExpectations);
                    if(self.additionalExpectations != null){
                        this.logger.debug(`Starting user-defined function with additional expectations...`);
                        self.additionalExpectations(this, this.logger);
                    }
                });
            });
        }
    }
}