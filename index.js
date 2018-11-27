const co     = require('co');
const expect = require('chai').expect;

class Chat {
    constructor(robotName, helper, context, options) {
        options = options || {};

        this.robotName = robotName;
        this.helper = helper;
        this.userMessages = [];
        this.robotReplies = {};
        this.robotReplyDelay = options.robotReplyDelay || 50;
        this.context = context;
    }

    doChain(){
        const self = this;
        return {
            thenBotReplies: function(message){
                const lastMessageIndex = self.userMessages.length - 1;
                const user = self.userMessages[lastMessageIndex].user;
                let botReplies = self.robotReplies[lastMessageIndex] || [];
                botReplies.push({message: `@${user} ${message}`});
                self.robotReplies[lastMessageIndex] = botReplies;
                return self.doChain();
            },
            thenBotReplyMatches: function(regex){
                const lastMessageIndex = self.userMessages.length - 1;
                const user = self.userMessages[lastMessageIndex].user;
                let botReplies = self.robotReplies[lastMessageIndex] || [];
                botReplies.push({regex});
                self.robotReplies[lastMessageIndex] = botReplies;
                return self.doChain();
            },
            user: function(username){
              return {
                  messagesBot: function(message, delay){
                      self.userMessages.push({user: username, message: `${self.robotName} ${message}`, delay});
                      return self.doChain();
                  },
                  messagesRoom: function(message, delay){
                      self.userMessages.push({user: username, message, delay});
                      return self.doChain();
                  }
              }
            },
            itShouldResultWith: function(summary){
                self.createTestSuite(summary)
            }
        }
    }

    createTestSuite(summary){
        const self = this;
        context(self.context, function() {
            beforeEach(function() {
                this.room = self.helper.createRoom();
                this.logger = this.room.robot.logger;

                this.logger.debug(`Adding messages for test '${self.context} ${summary}'. Messages:\n${JSON.stringify(self.userMessages)}`);
                return co(function*() {
                    for(const message of self.userMessages){
                        this.logger.debug(`Asking the bot with command ${JSON.stringify(message)}`);
                        yield this.room.user.say(message.user, message.message);
                        yield createDelayForRobot(message.delay || self.robotReplyDelay, this.logger);
                    }
                }.bind(this));
            });

            afterEach(function() {
                this.room.destroy();
            });

            it(summary, function() {
                const expectedMessages = generateExpectedMessages(self.userMessages, self.robotReplies);
                const actualMessages = this.room.messages;
                this.logger.debug(`Running test '${self.context} ${summary}'.\nExpected messages: ${JSON.stringify(expectedMessages)}.\nActual messages:   ${JSON.stringify(actualMessages)}`);

                expect(actualMessages.length).to.eql(expectedMessages.length,
                    'The amount of messages should be the same as expected');
                for(let i = 0; i < expectedMessages.length; i++){
                    const expectedMessage = expectedMessages[i];
                    const message = {user: actualMessages[i][0], message: actualMessages[i][1]};

                    if(expectedMessage.message != null){
                        expect(message).to.eql({user: expectedMessage.user, message: expectedMessage.message},
                            'The message in the chat history does not match');
                    }
                    else if(expectedMessage.regex != null){
                        expect(message.user).to.eql(expectedMessage.user, 'The user for this message does not match');
                        expect(message.message).to.match(expectedMessage.regex,
                            'The message in the chat history does not match provided regex');
                    }
                }
            });

            function createDelayForRobot(delay, logger){
                return new Promise(function(resolve) {
                    logger.debug(`Creating a delay for the robot to respond - ${delay} ms`);
                    setTimeout(function () {
                        resolve();
                    }, delay);
                });
            }

            function generateExpectedMessages(userMessages, robotReplies){
                let result = [];
                for(let i = 0; i < userMessages.length; i++){
                    result.push({user: userMessages[i].user, message: userMessages[i].message});
                    if(robotReplies[i] != null){
                        for(const botReply of robotReplies[i]){
                            result.push({user: self.robotName, regex: botReply.regex, message: botReply.message});
                        }
                    }
                }
                return result;
            }
        });
    }
}

const HubotChat = (function () {
    let self;

    function HubotChat(robotName, helper) {
        self = this;
        self.robotName = robotName;
        self.helper = helper;
    }

    HubotChat.prototype.context = function(context, options){
        const chat = new Chat(self.robotName, self.helper, context, options);
        return chat.doChain();
    };

    return HubotChat;
}());

module.exports = HubotChat;