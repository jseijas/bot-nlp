const builder = require('botbuilder');
const express = require('express');
const fs = require('fs');
const { Recognizer } = require('node-nlp');

const modelName = './hybrid.nlp';
const excelName = './hybrid.xls';

// Creates a connector for the chatbot
const connector = new builder.ChatConnector({
  appId: process.env.BOT_APP_ID,
  appPassword: process.env.BOT_APP_PASSWORD,
});

// Creates a node-nlp recognizer for the bot
const recognizer = new Recognizer();
if (fs.existsSync(modelName)) {
  recognizer.load(modelName);
} else {
  recognizer.loadExcel(excelName);
  recognizer.save(modelName);
}

// Creates the bot using a memory storage, with a main dialog that
// use the node-nlp recognizer to calculate the answer. 
const bot = new builder.UniversalBot(connector, (session) => {
  session.send(`You reached the default message handler. You said '${session.message.text}'.`);
}).set('storage', new builder.MemoryBotStorage());

recognizer.setBot(bot, true);

bot.dialog('/GreetingDialog', (session) => {
  session.send(`You reached the Greeting intent. You said '${session.message.text}'.`);
  session.endDialog();
});

bot.dialog('/HelpDialog', (session) => {
  session.send(`You reached the Help intent. You said '${session.message.text}'.`);
  session.endDialog();
});

bot.dialog('/CancelDialog', (session) => {
  session.send('You reached the Cancel intent. You said \'%s\'.', session.message.text);
  session.endDialog();
});

// Creates the express application
const app = express();
const port = process.env.PORT || 3000;
app.post('/api/messages', connector.listen());
app.listen(port);
console.log(`Chatbot listening on port ${port}`);
