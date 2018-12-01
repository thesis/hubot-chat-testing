"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chat_1 = require("./src/chat");
class HubotChatTesting {
    constructor(robotName = 'hubot', helper) {
        this.robotName = robotName;
        this.helper = helper;
    }
    get() {
        const chat = new chat_1.Chat(this.robotName, this.helper);
        return {
            chat: chat,
            when: function (context) {
                return chat.startChain(context);
            }
        };
    }
    when(context) {
        return new chat_1.Chat(this.robotName, this.helper).startChain(context);
    }
}
module.exports = HubotChatTesting;
