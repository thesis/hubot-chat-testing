'use strict';
const expect = require('chai').expect;
const HubotChatTesting = require('../dist/index.js');
const Helper = require('hubot-test-helper');

describe('Testing the adding messages API', () => {
    const chat = new HubotChatTesting('hubot', new Helper('../node_modules/hubot-encourage/dist/index.js'));

    chat.when('we have set up the environment variable')
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
        .expect('the bot should not remember its previous value');
});