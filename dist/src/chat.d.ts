import { BotMessage, ChatMessage } from "./chat-messages";
import { FirstChatChain } from "./chain-interfaces";
import { HubotChatOptions } from "./options";
export declare class Chat {
    readonly userMessages: ChatMessage[];
    readonly botMessages: BotMessage[];
    private settingBrainFunction?;
    private additionalExpectations?;
    private context;
    private readonly robotName;
    private readonly helper;
    private roomOptions?;
    private options;
    private readonly brainExpectations;
    constructor(robotName: string | undefined, helper: any, options: HubotChatOptions);
    startChain(context: string): FirstChatChain;
    private firstChain;
    private mainChain;
    private finishingChain;
    private botChain;
    private extendedBotChain;
    private userChain;
    private brainChain;
    private extendedBrainChain;
    private addUserMessage;
    private addBotMessage;
    private getLastUserMessage;
    private generateHubotTests;
}
