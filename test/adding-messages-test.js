'use strict';
const expect = require('chai').expect;
const HubotChatTesting = require('../dist/index.js');

describe('Testing the adding messages API', () => {
    const HubotChat = new HubotChatTesting('hubot');
    /**
     * @param this.userMessages    Array of the messages that users are sending to the bot or the room
     * @param this.botMessages     Array of the bot responses
     * @param this.chat.when            Method starting the new hubot testing suite
    */
    beforeEach(() => {
       this.chat = HubotChat.get();
       this.userMessages = this.chat.chat.userMessages;
       this.botMessages = this.chat.chat.botMessages;
    });

    context('Simple testing the chat when user messages', () => {
        it('should contain single message when only one user messages the bot directly', () => {
            this.chat.when('user sends message to the bot')
                .user('user').messagesBot('test message');

            expect(this.userMessages.length).to.eql(1, 'The amount of messages in the chat is not correct');
            expect(this.userMessages[0]).to.deep.eql({user: 'user', 'message' : 'hubot test message'},
                'The user message stored in the chat is not correct');

        });

        it('should contain single message when only one user messages the room', () => {
            this.chat.when('user sends message to the room')
                .user('user').messagesRoom('test message');

            expect(this.userMessages.length).to.eql(1, 'The amount of messages in the chat is not correct');
            expect(this.userMessages[0]).to.deep.eql({user: 'user', 'message' : 'test message'},
                'The user message stored in the chat is not correct');

        });

        it('should contain two message when two users were messaging in the chat', () => {
            this.chat.when('two users send different messages')
                .user('user').messagesRoom('test message')
                .user('user2').messagesBot('test message 2');

            expect(this.userMessages.length).to.eql(2, 'The amount of messages in the chat is not correct');
            expect(this.userMessages[0]).to.deep.eql({user: 'user', 'message' : 'test message'},
                'The first user message stored in the chat is not correct');
            expect(this.userMessages[1]).to.deep.eql({user: 'user2', 'message' : 'hubot test message 2'},
                'The second user message stored in the chat is not correct');
        });
    });

    context('Simple testing chat when bot replies', () => {
        it('should contain information about the bot reply', () => {
            this.chat.when('user sends message and bot replies')
                .user('user').messagesRoom('hi')
                .bot.repliesWith('hi');

            expect(this.botMessages.length).to.eql(1, 'The amount of messages in the chat is not correct');
            expect(this.botMessages[0].messages).to.deep.eql([{expectation: '@user hi', type: 0}],
                'The bot reply stored in the chat should have proper expectations');
            expect(this.botMessages[0].replyTo).to.deep.eql({user: 'user', message: 'hi'},
                'The bot reply stored in the chat should address proper user message');
        });

        it('should contain information about the bot reply matching regexp', () => {
            this.chat.when('user sends message and bot replies')
                .user('user').messagesRoom('hi')
                .bot.replyMatches(/hi/);

            expect(this.botMessages.length).to.eql(1, 'The amount of messages in the chat is not correct');
            expect(this.botMessages[0].messages).to.deep.eql([{expectation: /hi/, type: 1}],
                'The bot reply stored in the chat should have proper expectations');
            expect(this.botMessages[0].replyTo).to.deep.eql({user: 'user', message: 'hi'},
                'The bot reply stored in the chat should address proper user message');
        });

        it('should contain information about the bot reply matching regexp passed as string', () => {
            this.chat.when('user sends message and bot replies')
                .user('user').messagesRoom('hi')
                .bot.replyMatches('hi');

            expect(this.botMessages.length).to.eql(1, 'The amount of messages in the chat is not correct');
            expect(this.botMessages[0].messages).to.deep.eql([{expectation: /hi/, type: 1}],
                'The bot reply stored in the chat should have proper expectations');
            expect(this.botMessages[0].replyTo).to.deep.eql({user: 'user', message: 'hi'},
                'The bot reply stored in the chat should address proper user message');
        });

        it('should contain information about the bot reply including string', () => {
            this.chat.when('user sends message and bot replies')
                .user('user').messagesRoom('hi')
                .bot.replyIncludes('hi');

            expect(this.botMessages.length).to.eql(1, 'The amount of messages in the chat is not correct');
            expect(this.botMessages[0].messages).to.deep.eql([{expectation: 'hi', type: 2}],
                'The bot reply stored in the chat should have proper expectations');
            expect(this.botMessages[0].replyTo).to.deep.eql({user: 'user', message: 'hi'},
                'The bot reply stored in the chat should address proper user message');
        });

        it('should contain information about the bot reply matching two expectations', () => {
            this.chat.when('user sends message and bot replies')
                .user('user').messagesRoom('hi')
                .bot.replyIncludes('hi').and.itMatches(/@user/);

            expect(this.botMessages.length).to.eql(1, 'The amount of messages in the chat is not correct');
            expect(this.botMessages[0].messages).to.deep.eql([{expectation: 'hi', type: 2}, {expectation: /@user/, type: 1}],
                'The bot reply stored in the chat should have proper expectations');
            expect(this.botMessages[0].replyTo).to.deep.eql({user: 'user', message: 'hi'},
                'The bot reply stored in the chat should address proper user message');
        });
    });

    context('Testing the chatting between user and the bot', () => {
        it('should contain two bot replies for single user question', () => {
            this.chat.when('user sends message and bot replies')
                .user('user').messagesBot('how is the weather tomorrow?')
                .bot.repliesWith('let me ask my good friend with the access to the internet...')
                .bot.repliesWith('OK, he told me that tomorrow will be quite windy!');

            const userMessageExpectation = {user: 'user', message: 'hubot how is the weather tomorrow?'};

            expect(this.botMessages.length).to.eql(2, 'The amount of messages in the chat is not correct');
            expect(this.botMessages[0].messages).to.deep.eql([{expectation: '@user let me ask my good friend with the access to the internet...', type: 0}],
                'The first bot reply stored in the chat should have proper expectations');
            expect(this.botMessages[0].replyTo).to.deep.eql(userMessageExpectation,
                'The first bot reply stored in the chat should address proper user message');
            expect(this.botMessages[1].messages).to.deep.eql([{expectation: '@user OK, he told me that tomorrow will be quite windy!', type: 0}],
                'The second bot reply stored in the chat should have proper expectations');
            expect(this.botMessages[1].replyTo).to.deep.eql(userMessageExpectation,
                'The second bot reply stored in the chat should address proper user message');

            expect(this.userMessages.length).to.eql(1, 'The amount of messages in the chat is not correct');
            expect(this.userMessages[0]).to.deep.eql(userMessageExpectation,
                'The user message stored in the chat is not correct');
        });

        it('should contain two bot replies for two different users questions', () => {
            this.chat.when('user sends message and bot replies')
                .user('user').messagesBot('how is the weather tomorrow?')
                .bot.repliesWith('Tomorrow will be sunny.')
                .user('user2').messagesRoom('and how about today?')
                .bot.repliesWith('It seems that today is also sunny.');

            const firstUserMessageExpectation = {user: 'user', message: 'hubot how is the weather tomorrow?'};
            const secondUserMessageExpectation = {user: 'user2', message: 'and how about today?'};

            expect(this.botMessages.length).to.eql(2, 'The amount of messages in the chat is not correct');
            expect(this.botMessages[0].messages).to.deep.eql([{expectation: '@user Tomorrow will be sunny.', type: 0}],
                'The first bot reply stored in the chat should have proper expectations');
            expect(this.botMessages[0].replyTo).to.deep.eql(firstUserMessageExpectation,
                'The first bot reply stored in the chat should address proper user message');
            expect(this.botMessages[1].messages).to.deep.eql([{expectation: '@user2 It seems that today is also sunny.', type: 0}],
                'The second bot reply stored in the chat should have proper expectations');
            expect(this.botMessages[1].replyTo).to.deep.eql(secondUserMessageExpectation,
                'The second bot reply stored in the chat should address proper user message');

            expect(this.userMessages.length).to.eql(2, 'The amount of messages in the chat is not correct');
            expect(this.userMessages[0]).to.deep.eql(firstUserMessageExpectation,
                'The user message stored in the chat is not correct');
            expect(this.userMessages[1]).to.deep.eql(secondUserMessageExpectation,
                'The user message stored in the chat is not correct');
        });

        it('should react only to second user message when the answer is not specified for the first one', () => {
            this.chat.when('user sends message and bot replies')
                .user('user').messagesRoom('hello everyone')
                .user('user').messagesBot('how is the weather tomorrow?')
                .bot.repliesWith('Tomorrow will be sunny.');

            const userMessageExpectation = {user: 'user', message: 'hubot how is the weather tomorrow?'};

            expect(this.botMessages.length).to.eql(1, 'The amount of messages in the chat is not correct');
            expect(this.botMessages[0].messages).to.deep.eql([{expectation: '@user Tomorrow will be sunny.', type: 0}],
                'The first bot reply stored in the chat should have proper expectations');
            expect(this.botMessages[0].replyTo).to.deep.eql(userMessageExpectation,
                'The first bot reply stored in the chat should address proper user message');

            expect(this.userMessages.length).to.eql(2, 'The amount of messages in the chat is not correct');
            expect(this.userMessages[0]).to.deep.eql({user: 'user', message: 'hello everyone'},
                'The user message stored in the chat is not correct');
            expect(this.userMessages[1]).to.deep.eql(userMessageExpectation,
                'The user message stored in the chat is not correct');
        });
    });
});