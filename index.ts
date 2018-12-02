import {Chat} from "./src/chat";
import {FirstChatChain} from "./src/chain-interfaces";
import {HubotChatOptions} from "./src/options";

class HubotChatTesting {
    private readonly robotName: string;
    private readonly helper: any;
    private readonly options: HubotChatOptions;

    constructor(robotName: string = 'hubot', helper: any, options?: HubotChatOptions){
        this.robotName = robotName;
        this.helper = helper;
        this.options = options || new HubotChatOptions();
    }

    get() {
       const chat: Chat = new Chat(this.robotName, this.helper, this.options);
       return {
          chat: chat,
          when: function(context: string) : FirstChatChain {
              return chat.startChain(context);
          }
       }
    }

    when(context: string, options?: HubotChatOptions): FirstChatChain {
        const opts: HubotChatOptions = options || this.options;
        return new Chat(this.robotName, this.helper, opts).startChain(context);
    }
}

module.exports = HubotChatTesting;