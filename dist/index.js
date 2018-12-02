"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chat_1 = require("./src/chat");
const options_1 = require("./src/options");
class HubotChatTesting {
    constructor(robotName = 'hubot', helper, options) {
        this.robotName = robotName;
        this.helper = helper;
        this.options = options || new options_1.HubotChatOptions();
    }
    get() {
        const chat = new chat_1.Chat(this.robotName, this.helper, this.options);
        return {
            chat: chat,
            when: function (context) {
                return chat.startChain(context);
            }
        };
    }
    when(context, options) {
        const opts = options || this.options;
        return new chat_1.Chat(this.robotName, this.helper, opts).startChain(context);
    }
}
module.exports = HubotChatTesting;
