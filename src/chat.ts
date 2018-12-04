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
        this.context = context;
        return this.firstChain();
    }

    private firstChain() : FirstChatChain {
        const mainChain : MainChatChain = this.mainChain();
        const result = {
            setBrain: (f: (brain: any) => void) =>{
                this.settingBrainFunction = f;
                return this.firstChain();
            },
            setRoomOptions: (roomOptions: any) => {
                this.roomOptions = roomOptions;
                return this.firstChain();
            }
        };
        return {...mainChain, ...result};
    };

    private mainChain() : MainChatChain {
        const finishingChain = this.finishingChain();
        const mainChain = {
            user: (username: string) => {
                return this.userChain(username);
            },
            bot: this.botChain(),
            brain: this.brainChain()
        };
        return {...finishingChain, ...mainChain};
    }

    private finishingChain() : FinishingStep {
        return {
            additionalExpectations: (f: (test: any, logger: any) => void) => {
                this.additionalExpectations = f;
                return this.finishingChain();
            },
            expect: this.generateHubotTests()
        }
    }

    private botChain() : BotChatChain {
        return {
            messagesRoom: (message: string) : ExtendedBotChatChain => {
                const msg = `${message}`;
                const reply = this.addBotMessage(msg, BotMessageExpectations.EQUAL);
                return this.extendedBotChain(reply);
            },
            repliesWith: (message: string) : ExtendedBotChatChain => {
                const lastUserMessage = this.getLastUserMessage();
                const msg = `@${lastUserMessage.user} ${message}`;
                const reply = this.addBotMessage(msg, BotMessageExpectations.EQUAL);
                return this.extendedBotChain(reply);
            },
            replyMatches: (pattern: string | RegExp) : ExtendedBotChatChain => {
                let message: RegExp = typeof pattern === "string" ? new RegExp(pattern) : pattern;
                const reply = this.addBotMessage(message, BotMessageExpectations.MATCH);
                return this.extendedBotChain(reply);
            },
            replyIncludes: (messagePart: string): ExtendedBotChatChain => {
                const reply = this.addBotMessage(messagePart, BotMessageExpectations.INCLUDE);
                return this.extendedBotChain(reply);
            }
        };
    }

    private extendedBotChain(reply: BotMessage) : ExtendedBotChatChain {
        const mainChain : MainChatChain = this.mainChain();
        const result = {
            and: {
                itMatches: (pattern: string | RegExp) : ExtendedBotChatChain => {
                    let message: RegExp = typeof pattern === "string" ? new RegExp(pattern) : pattern;
                    reply.addExpectation(message, BotMessageExpectations.MATCH);
                    return this.extendedBotChain(reply);
                },
                itIncludes: (messagePart: string): ExtendedBotChatChain => {
                    reply.addExpectation(messagePart, BotMessageExpectations.INCLUDE);
                    return this.extendedBotChain(reply);
                }
            }
        };
        return {...mainChain, ...result};
    }

    private userChain(username: string) : UserChatChain {
        return {
            messagesBot: (message: string, delay?: number) : MainChatChain => {
                this.addUserMessage(username, `${this.robotName} ${message}`, delay);
                return this.mainChain();
            },
            messagesRoom: (message: string, delay?: number) : MainChatChain => {
                this.addUserMessage(username, message, delay);
                return this.mainChain();
            }
        }
    }

    private brainChain() : BrainChain {
        return {
            includes: (key: string, object: any) : ExtendedBrainChain => {
                this.brainExpectations[key] = object;
                return this.extendedBrainChain();
            }
        }
    }

    private extendedBrainChain() : ExtendedBrainChain {
        const finishingStep: FinishingStep = this.finishingChain();
        const result = {
            and: {
                itIncludes: (key: string, object: any) : ExtendedBrainChain => {
                    this.brainExpectations[key] = object;
                    return this.extendedBrainChain();
                }
            }
        };
        return {...finishingStep, ...result};
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

    private generateHubotTests() {
        const self: Chat = this;
        const context = this.context;
        return (summary: string) : void => {
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