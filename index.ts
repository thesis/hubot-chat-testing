import {Chat} from "./src/chat";
import {FirstChatChain} from "./src/chain-interfaces";

class HubotChatTesting {
    private readonly robotName: string;
    private readonly helper: any;

    constructor(robotName: string = 'hubot', helper: any){
        this.robotName = robotName;
        this.helper = helper;
    }

    get() {
       const chat: Chat = new Chat(this.robotName, this.helper);
       return {
          chat: chat,
          when: function(context: string) : FirstChatChain {
              return chat.startChain(context);
          }
       }
    }

    when(context: string): FirstChatChain {
        return new Chat(this.robotName, this.helper).startChain(context);
    }
}

module.exports = HubotChatTesting;