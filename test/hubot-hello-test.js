'use strict';
const expect = require('chai').expect;
const HubotChatTesting = require('../dist/index.js');
const Helper = require('hubot-test-helper');

class NewMockResponse extends Helper.Response {
    random(items) {
        return items[0];
    }
}
/***
 * Test taken from the hubot-encourage module
 * Script: https://github.com/HaroldPutman/hubot-encourage/blob/master/test/index.js
***/
describe('Testing the library with hubot-hello', () => {
    const roomOptions = {response: NewMockResponse};
    const chat = new HubotChatTesting('hubot', new Helper('../node_modules/hubot-encourage/dist/index.js'), null, roomOptions);

    chat.when('user is asking for a little encourage for Rex')
        .user('alice').messagesBot('encourage Rex')
        .bot.messagesRoom('Great job, Rex!')
        .expect('the bot should respond when asked to encourage person');

    chat.when('user is asking for a little encourage for everyone')
        .user('kumar').messagesBot('encourage us')
        .bot.messagesRoom('Great job today, everyone!')
        .expect('the bot should respond when asked to encourage everyone');

    chat.when('user is asking for a little encourage for everyone')
        .user('bob').messagesBot('encourage me')
        .bot.messagesRoom('Great job, bob!')
        .expect('the bot should encourage me when asked');

    // Additional tests just for test our module
    chat.when('user is asking for a little encourage for Rex')
        .user('alice').messagesBot('encourage Rex')
        .bot.replyIncludes('Great job')
            .and.itMatches(/Great job,\s+[a-zA-Z]+!/)
            .and.itIncludes('Rex')
        .expect('the bot should respond when asked to encourage person');
});