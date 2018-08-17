const builder = require('botbuilder');
const express = require('express');
const { Recognizer } = require('node-nlp');

// Creates a connector for the chatbot
const connector = new builder.ChatConnector({
  appId: process.env.BOT_APP_ID,
  appPassword: process.env.BOT_APP_PASSWORD,
});

// Creates a node-nlp recognizer for the bot
const recognizer = new Recognizer();
recognizer.nlpManager.addLanguage('en');
recognizer.nlpManager.addDocument('en', 'Hello', 'Greeting');
recognizer.nlpManager.addDocument('en', 'Hey', 'Greeting');
recognizer.nlpManager.addDocument('en', 'Hi!', 'Greeting');
recognizer.nlpManager.addDocument('en', 'I need help', 'Help');
recognizer.nlpManager.addDocument('en', 'Help me', 'Help');
recognizer.nlpManager.addDocument('en', 'help', 'Help');
recognizer.nlpManager.addDocument('en', 'I want to cancel', 'Cancel');
recognizer.nlpManager.addDocument('en', 'cancel', 'Cancel');
recognizer.nlpManager.addDocument('en', 'please cancel', 'Cancel');
recognizer.train();

// Creates the bot using a memory storage, with a main dialog that
// use the node-nlp recognizer to calculate the answer. 
const bot = new builder.UniversalBot(connector, (session) => {
  session.send(`You reached the default message handler. You said '${session.message.text}'.`);
}).set('storage', new builder.MemoryBotStorage());

bot.recognizer(recognizer);

bot.dialog('GreetingDialog', (session) => {
  session.send(`You reached the Greeting intent. You said '${session.message.text}'.`);
  session.endDialog();
}).triggerAction({ matches: 'Greeting' });

bot.dialog('HelpDialog', (session) => {
  session.send(`You reached the Help intent. You said '${session.message.text}'.`);
  session.endDialog();
}).triggerAction({ matches: 'Help' });

bot.dialog('CancelDialog', (session) => {
  session.send('You reached the Cancel intent. You said \'%s\'.', session.message.text);
  session.endDialog();
}).triggerAction({ matches: 'Cancel' });

// Creates the express application
const app = express();
const port = process.env.PORT || 3000;
app.post('/api/messages', connector.listen());
app.listen(port);
console.log(`Chatbot listening on port ${port}`);
