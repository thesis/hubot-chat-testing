import {BotMessage, BotMessageExpectations, ChatMessage, SimpleMessage} from "./chat-messages";
import {expect} from 'chai'

const co = require('co');

export class TestWorker{
    static prepareTest(test: any, helper: any, roomOptions?: any){
        test.room = helper.createRoom(roomOptions);
        test.logger = test.room.robot.logger;
        test.logger.debug(`Created room with options: ${JSON.stringify(roomOptions)}`)
    }

    static finishTest(test: any){
        test.room.destroy();
    }

    static addUserMessages(test: any, userMessages: ChatMessage[]){
        return co(function*() {
            for(const message of userMessages){
                test.logger.debug(`Asking the bot with command ${JSON.stringify(message)}`);
                yield test.room.user.say(message.user, message.message);
                yield TestWorker.createDelayForRobot(message.delay, test);
            }
        }.bind(test));
    }

    static performExpectations(test: any, userMessages: ChatMessage[], botMessages: BotMessage[]){
        const actualMessages = test.room.messages;

        let index = 0;
        for(const userMessage of userMessages){
            const message = {user: actualMessages[index][0], message: actualMessages[index][1]};
            const expectedMessage = {user: userMessage.user, message: userMessage.message};
            expect(message).to.eql(expectedMessage, 'User message does not match the message in the chat history');
            index++;

            const botReplies = TestWorker.findBotRepliesToMessage(message, botMessages);
            for(const botReply of botReplies){
                const reply = {user: actualMessages[index][0], message: actualMessages[index][1]};
                TestWorker.compareBotReplyWithMessage(reply, botReply);
                index++;
            }
        }
    }

    static performBrainExpectations(test: any, brainExpectations: any){
        const brain = test.room.robot.brain;
        const keys = Object.keys(brainExpectations);

        if(keys.length > 0){
            test.logger.debug(`Checking user expectations of the brain [${keys.join(', ')}]...`);
            for(const key of keys){
                const actualValue = brain.get(key);
                const expectedValue = brainExpectations[key];
                expect(actualValue).to.deep.eq(expectedValue,
                    'The object stored in hubot brain does not match assertion')
            }
        }
    }

    private static createDelayForRobot(delay: number, test: any){
        return new Promise(function(resolve) {
            test.logger.debug(`Creating a delay for the robot to respond - ${delay} ms`);
            setTimeout(function () {resolve();}, delay);
        });
    }

    private static findBotRepliesToMessage(message: SimpleMessage, botMessages: BotMessage[]) : BotMessage[]{
        let result: BotMessage[] = [];

        for(const botMessage of botMessages){
            if(botMessage.replyTo.message == message.message && botMessage.replyTo.user == message.user){
                result.push(botMessage);
            }
        }

        return result;
    }

    private static compareBotReplyWithMessage(message: SimpleMessage, botReply: BotMessage){
        expect(message.user).to.eql(botReply.name, 'The message should be written by bot, but it is not');

        for(const expectation of botReply.messages){
            switch(expectation.type){
                case BotMessageExpectations.EQUAL:
                    expect(message.message).to.eql(expectation.expectation,
                        'The message written by bot does not equal the message in the history');
                break;
                case BotMessageExpectations.MATCH:
                    expect(message.message).to.match(new RegExp(expectation.expectation),
                        'The message written by bot does not match provided regexp');
                break;
                case BotMessageExpectations.INCLUDE:
                    expect(message.message).to.include(expectation.expectation,
                        'The message written by bot does not include provided message part');
                break;
            }
        }
    }
}