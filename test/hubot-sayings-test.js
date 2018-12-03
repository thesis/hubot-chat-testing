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
 * Testing brain usage with hubot-sayings module
 * Script: https://github.com/gjbianco/hubot-sayings/blob/master/src/hubot-sayings.js
***/
describe('Testing the library with hubot-hello', () => {
    const roomOptions = {response: NewMockResponse};
    const chat = new HubotChatTesting('hubot', new Helper('../node_modules/hubot-sayings/src/hubot-sayings.js'), null, roomOptions);

    chat.when('user is asking the bot to remember the value')
        .user('alice').messagesRoom('!remember name value')
        .bot.messagesRoom("okay, i'll remember that")
        .brain.includes('hubot-sayings-name', 'value')
        .expect('the bot should remember the values');

    chat.when('user is asking the bot to tell the value of the remembered variable')
        .setBrain((brain => {
            brain.set('hubot-sayings-name', 'value');
        }))
        .user('alice').messagesRoom('!recall name')
        .bot.messagesRoom("value")
        .expect('the bot should tell the value of the remembered variable');

    chat.when('user is asking the bot to tell the value of the non-remembered variable')
        .user('alice').messagesRoom('!recall name')
        .bot.messagesRoom("i don't know that")
        .expect('the bot should tell the value of the remembered variable');

    chat.when('user is asking the bot to forget the value of the remembered variable')
        .setBrain((brain => {
            brain.set('hubot-sayings-name', 'value');
            brain.set('variable2', 'value');
        }))
        .user('alice').messagesRoom('!forget name')
        .bot.messagesRoom('forgotten')
        .brain.includes('hubot-sayings-name', null)
            .and.itIncludes('variable2', 'value')
        .additionalExpectations((test) => {
            expect(test.room.messages.length).to.eql(2)
        })
        .expect('the bot should forget it');
});