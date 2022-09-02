import {BotMessage, BotMessageExpectations, ChatMessage, SimpleMessage} from "./chat-messages";
import {expect} from 'chai'
import {BrainExpectations} from "./chain-interfaces";

const co = require('co');

export class TestWorker{
    static prepareTest(test: any, helper: any, roomOptions?: any){
        test.room = helper.createRoom(roomOptions);
        test.logger = test.room.robot.logger;
        test.logger.debug(`Created room with options: ${JSON.stringify(roomOptions)}`)
    }

    static setupEnvironmentVariables(test: any, environmentVariables?: {[key: string]: string}): {[key: string]: string | undefined}{
        let result: any = {};
        if(environmentVariables){
            test.logger.debug(`Setting up environment variables: ${JSON.stringify(environmentVariables)}`);
            for(const variable of Object.keys(environmentVariables)){
                result[variable] = process.env[variable] || null;
                process.env[variable] = environmentVariables[variable];
            }
        }
        return result;
    }

    static finishTest(test: any, environmentVariables: {[key: string]: string}){
        test.logger.debug(`Reverting the environment variables to its previous state: ${JSON.stringify(environmentVariables)}`);
        for(const variable of Object.keys(environmentVariables)){
            process.env[variable] = environmentVariables[variable];
        }
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
            const expectedMessage = {user: userMessage.user, message: userMessage.message};

            expect(actualMessages.length).to.be.greaterThan(index,
                `Could not find user message '${expectedMessage.message}' in the chat history`);

            const message = {user: actualMessages[index][0], message: actualMessages[index][1]};
            index++;

            const botReplies = TestWorker.findBotRepliesToMessage(message, botMessages);
            for(const botReply of botReplies){
                expect(actualMessages.length).to.be.greaterThan(index,
                    `Could not find bot reply in the chat history for message '${expectedMessage.message}'`);
                const reply = {user: actualMessages[index][0], message: actualMessages[index][1]};
                TestWorker.compareBotReplyWithMessage(reply, botReply);
                index++;
            }
        }
    }

    static performBrainExpectations(test: any, brainExpectations: BrainExpectations){
        const brain = test.room.robot.brain;
        test.logger.debug(`Brain expectations: ${JSON.stringify(brainExpectations)}.`);
        TestWorker.performBrainContainsExpectations(brain, brainExpectations.keys);
        TestWorker.performBrainObjectExpectations(brain, brainExpectations.equals, 'equals');
        TestWorker.performBrainObjectExpectations(brain, brainExpectations.includes, 'includes');
    }

    private static performBrainContainsExpectations(brain: any, containExpectations: string[]){
        for(const expectation of containExpectations){
            expect(brain.get(expectation)).to.not.exist;
        }
    }

    private static performBrainObjectExpectations(brain: any, expectations: {key: string,  reverted:boolean, obj: any}[], type: string){
        for(const expectation of expectations){
            const actualValue = brain.get(expectation.key);
            const expectedValue = expectation.obj;
            const reverted = expectation.reverted;

            switch(type){
                case 'equals':
                    if(reverted){
                        expect(actualValue).to.not.deep.eq(expectedValue,
                            'The object in bot\'s brain should not equal expected value');
                    }
                    else{
                        expect(actualValue).to.deep.eq(expectedValue,
                            'The object in bot\'s brain is not the same as expected value');
                    }
                break;
                case 'includes':
                    if(reverted){
                        expect(actualValue).to.not.include(expectedValue,
                            'The object in bot\s brain should not include expected value');
                    }
                    else{
                        expect(actualValue).to.include(expectedValue,
                            'The object in bot\s brain does not include expected value');
                    }
                break;
            }
        }
    }

    private static createDelayForRobot(delay: number, test: any){
        return new Promise<void>(function(resolve) {
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