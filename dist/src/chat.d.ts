import { BotMessage, ChatMessage } from "./chat-messages";
import { FirstChatChain } from "./chain-interfaces";
import { HubotChatOptions } from "./options";
export declare class Chat {
    readonly userMessages: ChatMessage[];
    readonly botMessages: BotMessage[];
    private settingBrainFunction;
    private additionalExpectations;
    private context;
    private readonly robotName;
    private readonly helper;
    private options;
    constructor(robotName: string | undefined, helper: any, options: HubotChatOptions);
    startChain(context: string): FirstChatChain;
    private mainChatChain;
    private extendedBotChain;
    private generateBotAndChain;
    private botPossibilities;
    private userPossibilities;
    private addUserMessage;
    private addBotMessage;
    private getLastUserMessage;
    private generateHubotTests;
}