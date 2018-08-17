const builder = require('botbuilder');
const express = require('express');
const fs = require('fs');
const { Recognizer } = require('node-nlp');
const modelName = './smalltalk.nlp';
const excelName = './smalltalk.xls';

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
  recognizer.recognize(session, (err, data) => {
    session.send(data.answer || 'I don\'t understand');
  });
}).set('storage', new builder.MemoryBotStorage());

// Creates the express application
const app = express();
const port = process.env.PORT || 3000;
app.post('/api/messages', connector.listen());
app.listen(port);
console.log(`Chatbot listening on port ${port}`);
