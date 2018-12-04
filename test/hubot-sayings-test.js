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
        .brain.key('hubot-sayings-name').equals('value')
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
        }))
        .user('alice').messagesRoom('!forget name')
        .bot.messagesRoom('forgotten')
        .brain.not.contains('hubot-sayings-name')
        .expect('the bot should forget it');

    // Additional checks of brain
    chat.when('the bot remembers some variable')
        .setBrain((brain => {
            brain.set('my-variable', {a: 1, b: 'test'});
        }))
        .brain.key('my-variable').equals({a: 1, b: 'test'})
        .brain.key('my-variable').includes({a: 1})
        .brain.key('my-variable').not.includes({a: 12})
        .brain.key('my-variable').not.equals({a: 1})
        .brain.not.contains('hubot-sayings-name')
        .additionalExpectations((test) => {
            expect(test.room.messages.length).to.be.eq(0);
        })
        .expect('the library should be able to test it properly');
});