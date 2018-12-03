"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chat_1 = require("./src/chat");
const options_1 = require("./src/options");
class HubotChatTesting {
    constructor(robotName = 'hubot', helper, options, roomOptions) {
        this.robotName = robotName;
        this.helper = helper;
        this.options = options || new options_1.HubotChatOptions();
        this.roomOptions = roomOptions;
    }
    get() {
        const self = this;
        const chat = new chat_1.Chat(this.robotName, this.helper, this.options);
        return {
            chat: chat,
            when: function (context) {
                return chat.startChain(context).setRoomOptions(self.roomOptions);
            }
        };
    }
    when(context, options) {
        const opts = options || this.options;
        return new chat_1.Chat(this.robotName, this.helper, opts).startChain(context).setRoomOptions(this.roomOptions);
    }
}
module.exports = HubotChatTesting;
