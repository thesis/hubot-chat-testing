"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chat_messages_1 = require("./chat-messages");
const chai_1 = require("chai");
const co = require('co');
class TestWorker {
    static prepareTest(test, helper, roomOptions) {
        test.room = helper.createRoom(roomOptions);
        test.logger = test.room.robot.logger;
        test.logger.debug(`Created room with options: ${JSON.stringify(roomOptions)}`);
    }
    static finishTest(test) {
        test.room.destroy();
    }
    static addUserMessages(test, userMessages) {
        return co(function* () {
            for (const message of userMessages) {
                test.logger.debug(`Asking the bot with command ${JSON.stringify(message)}`);
                yield test.room.user.say(message.user, message.message);
                yield TestWorker.createDelayForRobot(message.delay, test);
            }
        }.bind(test));
    }
    static performExpectations(test, userMessages, botMessages) {
        const actualMessages = test.room.messages;
        let index = 0;
        for (const userMessage of userMessages) {
            const message = { user: actualMessages[index][0], message: actualMessages[index][1] };
            const expectedMessage = { user: userMessage.user, message: userMessage.message };
            chai_1.expect(message).to.eql(expectedMessage, 'User message does not match the message in the chat history');
            index++;
            const botReplies = TestWorker.findBotRepliesToMessage(message, botMessages);
            for (const botReply of botReplies) {
                const reply = { user: actualMessages[index][0], message: actualMessages[index][1] };
                TestWorker.compareBotReplyWithMessage(reply, botReply);
                index++;
            }
        }
    }
    static performBrainExpectations(test, brainExpectations) {
        const brain = test.room.robot.brain;
        test.logger.debug(`Brain expectations: ${JSON.stringify(brainExpectations)}.`);
        TestWorker.performBrainContainsExpectations(brain, brainExpectations.keys);
        TestWorker.performBrainObjectExpectations(brain, brainExpectations.equals, 'equals');
        TestWorker.performBrainObjectExpectations(brain, brainExpectations.includes, 'includes');
    }
    static performBrainContainsExpectations(brain, containExpectations) {
        for (const expectation of containExpectations) {
            chai_1.expect(brain.get(expectation)).to.not.exist;
        }
    }
    static performBrainObjectExpectations(brain, expectations, type) {
        for (const expectation of expectations) {
            const actualValue = brain.get(expectation.key);
            const expectedValue = expectation.obj;
            const reverted = expectation.reverted;
            switch (type) {
                case 'equals':
                    if (reverted) {
                        chai_1.expect(actualValue).to.not.deep.eq(expectedValue, 'The object in bot\'s brain should not equal expected value');
                    }
                    else {
                        chai_1.expect(actualValue).to.deep.eq(expectedValue, 'The object in bot\'s brain is not the same as expected value');
                    }
                    break;
                case 'includes':
                    if (reverted) {
                        chai_1.expect(actualValue).to.not.include(expectedValue, 'The object in bot\s brain should not include expected value');
                    }
                    else {
                        chai_1.expect(actualValue).to.include(expectedValue, 'The object in bot\s brain does not include expected value');
                    }
                    break;
            }
        }
    }
    static createDelayForRobot(delay, test) {
        return new Promise(function (resolve) {
            test.logger.debug(`Creating a delay for the robot to respond - ${delay} ms`);
            setTimeout(function () { resolve(); }, delay);
        });
    }
    static findBotRepliesToMessage(message, botMessages) {
        let result = [];
        for (const botMessage of botMessages) {
            if (botMessage.replyTo.message == message.message && botMessage.replyTo.user == message.user) {
                result.push(botMessage);
            }
        }
        return result;
    }
    static compareBotReplyWithMessage(message, botReply) {
        chai_1.expect(message.user).to.eql(botReply.name, 'The message should be written by bot, but it is not');
        for (const expectation of botReply.messages) {
            switch (expectation.type) {
                case chat_messages_1.BotMessageExpectations.EQUAL:
                    chai_1.expect(message.message).to.eql(expectation.expectation, 'The message written by bot does not equal the message in the history');
                    break;
                case chat_messages_1.BotMessageExpectations.MATCH:
                    chai_1.expect(message.message).to.match(new RegExp(expectation.expectation), 'The message written by bot does not match provided regexp');
                    break;
                case chat_messages_1.BotMessageExpectations.INCLUDE:
                    chai_1.expect(message.message).to.include(expectation.expectation, 'The message written by bot does not include provided message part');
                    break;
            }
        }
    }
}
exports.TestWorker = TestWorker;
