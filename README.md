# hubot-chat-testing
NodeJS module to be used as a helper with automatic testing.

## Why hubot-chat-testing?
Hubot chat testing module is a wrapper for the 
[hubot-test-helper](https://github.com/mtsmfm/hubot-test-helper) library
and can be used to write easier to understand tests for Hubot.

The `hubot-test-helper` library provides great help with technical side of the tests - 
it manages the bot and the room creation and it allows for adding new messages to the bot. 
The biggest problem - for me - is the readability for those tests. Let's use an example:

```javascript
context('testing good manners of the bot', function() {
    beforeEach(function() {
      return co(function*() {
        yield this.room.user.say('user', 'hubot hi');
        // maybe some promise with delaying the response...?
        yield this.room.user.say('user2', 'hi');
      }.bind(this));
    });

    it('should be polite and say hi when user is greeting', function() {
      expect(this.room.messages[0]).to.be.eql(['user', 'hubot hi']);
      expect(this.room.messages[1]).to.be.eql(['hubot', '@user hi']);
      expect(this.room.messages[2]).to.be.eql(['user2', 'hi']);
      expect(this.room.messages[3]).to.be.eql(['hubot', '@user2 hi']);
    });
});
```
The user of this library has to remember that all the messages should be defined in the 
`beforeEach` section, where the `co` library is used altogether with the `yield` keyword. 
What is more important, when the bot's response takes some additional time, 
the user also needs to include `Promise` with delay.

The Array type storing messages is also a little hard to expect more complex test suites.

You have to remember to include `hubot` and `@user` prefixes in some cases of messages.

Next problem with readability is that the bot responses are defined in different section, `it`.
This way the chat history seems to be a little unsettled while normally it looks like conversation
between user and bot, similar to "user => bot => user => bot" like so:

```javascript
    chat.when('the user says hi to the bot')
    .user('user').messagesBot('hi')
    .bot.repliesWith('hi')
    .expect('the bot should say hi to the user')
``` 

And this is exactly what I had in mind when writing tests for Hubot scripts. Why writing so much
copy-paste-like code, when in most of the cases you just want to achieve/test a simple flow of the
conversation? 

The `hubot-chat-testing` module will generate the `hubot-test-helper` scripts with remembering
about all the technical stuff - you just have to provide chat history.

## Usage

### Installing the module
```bash
npm install git+https://gitlab.com/TheDeeM/hubot-chat-testing.git
```
then all you have to do is to require the library and set-up the `hubot-test-helper` helper:
```javascript
const HubotChatTesting = require('hubot-chat-testing');
const Helper = require('hubot-test-helper');

const chat = new HubotChatTesting('hubot', new Helper('../scripts/orders.js'));
```

### Writing the tests
Typical flow of the conversation:
```javascript
 chat.when('testing good manners of the bot')
    .user('user').messagesBot('hi')                // User: hubot hi
    .bot.repliesWith('hi')                         // Hubot: @user hi
    .user('user2').messagesBot('hi')               // User2: @hubot hi
    .bot.repliesWith('hi')                         // Hubot: @user2 hi
    .user('user').messagesRoom('hello everyone')   // User: hello everyone
    .bot.repliesWith('hi')                         // Hubot: @user hi
    .expect('the bot should be polite and say hi when user is greeting');
```

If you don't want to check the whole response of the bot, but instead you just need to 
check whether the response matches some regexp:
```javascript
 chat.when('the user appears after years of absence')
    .user('user').messagesRoom('hi father')
    // Lets assume that bot normally says "No, I am your father!" to "hi father"
    .bot.replyMatches(/(Luke|No), I am your father/)
    .expect('the bot should tell the user the truth');
```

If the bot feels very talkative, you can just use:
```javascript
 chat.when('the user is greeting in the room')
    .user('user').messagesRoom('hi')
    .bot.repliesWith('Have I met you before? Let me think...')
    .bot.repliesWith('Oh yes, now I remember! You\'re that guy the admin told me to worry about!')
    .expect('the bot should react to it with some chit-chat');
```

If you want to perform multiple checks for single bot's response:
```javascript
chat.when('the user asks for a very complex answer')
    .user('user').messagesBot('say dirty things to me')
    .bot.replyIncludes('Lorem ipsum dolor sit amet,')
        .and.itMatches(/mattis sit amet dolor$/i)
        .and.itIncludes('Etiam aliquet sagittis')
    .expect('the bot should react to it with some chit-chat');
```

If the bot needs time to compute an answer, you can increase the waiting time by using:
```javascript
// this delay will be used by default in all test scenarios
const chat = new HubotChatTesting('hubot', new Helper('../scripts/orders.js'), {answerDelay: 50}); 

// this delay will be used in this specific test scenario
chat.when('the user asks for a very complex answer', {answerDelay: 200}) 
    .user('user').messagesBot('a very intriguing message', 400) // only this request will wait 400 ms for an answer
```

For more examples, please give the [tests](test) a try.

## Contribution
I am willing to greet any contributions that would make testing Hubot's scripts even more readable.
If you want to contribute, just fork the project and add some changes!