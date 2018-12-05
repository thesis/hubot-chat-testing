'use strict';
const expect = require('chai').expect;
const HubotChatTesting = require('../dist/index.js');
const Helper = require('hubot-test-helper');


/***
 * Testing some failing scenarios
 * TODO: Check how it can be tested automatically without the need to manually uncomment the tests
 * Those tests are commented, because they will always fail - its their purpose to check whether the library manages
 * failing assertions correctly. Please uncomment them to check if all of those tests are failing - then it's OK.
 * Script: https://github.com/gjbianco/hubot-sayings/blob/master/src/hubot-sayings.js
***/
describe('Testing whether the library correctly detects fails of assertions', () => {
    const chat = new HubotChatTesting('hubot', new Helper('../node_modules/hubot-encourage/dist/index.js'));

    /*
    context('checking the chat history', () => {
        chat.when('We are expecting the bot to reply, but it did not happen')
            .user('user').messagesRoom('the bot will not react to this message')
            .bot.repliesWith('this message will never be shown in the chat history')
            .expect('hubot-chat-testing should show an error that it could not find the message in the chat history');

        chat.when('We are expecting the bot message to be equal to some string, but the bot respond differently')
            .user('user').messagesBot('encourage Rex')
            .bot.repliesWith('this message is different than expected in our tests')
            .expect('hubot-chat-testing should show an error that the messages does not match');

        chat.when('The message matches general expectation, but not the second one')
            .user('user').messagesBot('encourage Rex')
            .bot.replyIncludes('Rex').and.itIncludes('this will not be included')
            .expect('hubot-chat-testing should show an error that the messages does not match');

        chat.when('We are expecting some additional assertions to be true, but they are not')
            .user('user').messagesBot('encourage Rex')
            .bot.replyIncludes('Rex')
            .additionalExpectations((test) => {
                expect(test.room.messages.length).to.be.eq(3, 'The amount of messages in the chat is not as expected');
            })
            .expect('hubot-chat-testing should show an error that the additional expectations were not met');
    });

    context('checking the brain', () => {
        chat.when('We are expecting that the bot will not have variable in the brain, but it does')
            .setBrain((brain) => {
                brain.set('variable', 'value');
            })
            .user('user').messagesBot('encourage Rex')
            .bot.replyIncludes('Rex')
            .brain.not.contains('variable')
            .expect('hubot-chat-testing should show an error that the brain contains the key');

        chat.when('We are expecting that the bot will have incorrect variable in the memory')
            .setBrain((brain) => {
                brain.set('variable', 'value');
            })
            .user('user').messagesBot('encourage Rex')
            .bot.replyIncludes('Rex')
            .brain.key('variable').equals('this is not the proper value')
            .expect('hubot-chat-testing should show an error that the object in the brain does not match expected value');

        chat.when('We are expecting that the bot brain will include incorrect object')
            .setBrain((brain) => {
                brain.set('variable', {a: 'some', b: 'object'});
            })
            .user('user').messagesBot('encourage Rex')
            .bot.replyIncludes('Rex')
            .brain.key('variable').includes({c: 'this is not included in the real object'})
            .expect('hubot-chat-testing should show an error that the object does not include the keys');

        chat.when('We are expecting that the bot brain will not include correct object')
            .setBrain((brain) => {
                brain.set('variable', {a: 'this key is included', b: 'other key'});
            })
            .user('user').messagesBot('encourage Rex')
            .bot.replyIncludes('Rex')
            .brain.key('variable').not.includes({a: 'this key is included'})
            .expect('hubot-chat-testing should show an error that the object does include the keys');

        chat.when('We are expecting that the bot will not have the correct variable in the memory')
            .setBrain((brain) => {
                brain.set('variable', 'value');
            })
            .user('user').messagesBot('encourage Rex')
            .bot.replyIncludes('Rex')
            .brain.key('variable').not.equals('value')
            .expect('hubot-chat-testing should show an error that the object in the brain does equal the expected value');
    });
    */
});