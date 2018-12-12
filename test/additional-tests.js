'use strict';
const expect = require('chai').expect;
const HubotChatTesting = require('../dist/index.js');
const Helper = require('hubot-test-helper');

process.env.SOME_EXTERNAL_VARIABLE = 'its-value';

describe('Testing the adding messages API', () => {
    const chat = new HubotChatTesting('hubot', new Helper('../node_modules/hubot-encourage/dist/index.js'));

    chat.when('we have set up the new environment variable')
        .setEnvironmentVariables({
            MY_VARIABLE: 'my-value'
        })
        .user('alice').messagesBot('encourage Rex')
        .bot.replyIncludes('Rex')
        .additionalExpectations(() => {
            expect(process.env.MY_VARIABLE).to.eql('my-value');
        })
        .expect('the library should properly set up it');

    chat.when('we are not setting the environment variable')
        .user('alice').messagesBot('encourage Rex')
        .bot.replyIncludes('Rex')
        .additionalExpectations(() => {
            expect(process.env.MY_VARIABLE).to.not.eql('my-value');
        })
        .expect('the library should not remember its previous value');

    chat.when('we have overwrite the environment variable')
        .setEnvironmentVariables({
            SOME_EXTERNAL_VARIABLE: 'new-value'
        })
        .user('alice').messagesBot('encourage Rex')
        .bot.replyIncludes('Rex')
        .additionalExpectations(() => {
            expect(process.env.SOME_EXTERNAL_VARIABLE).to.eql('new-value');
        })
        .expect('the library should properly set up it');

    chat.when('we are not setting the environment variable')
        .user('alice').messagesBot('encourage Rex')
        .bot.replyIncludes('Rex')
        .additionalExpectations(() => {
            expect(process.env.SOME_EXTERNAL_VARIABLE).to.eql('its-value');
        })
        .expect('the library should user previous value of that environment variable');
});