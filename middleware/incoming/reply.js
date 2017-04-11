const watson = require('watson-developer-cloud');
const config = require('../../config');
const watsonConversationStorageMiddleware = require('../watson_conversation_storage');
const watsonConversation = watson.conversation(config.watsonConversationCredentials);
const watsonNaturalLanguageUnderstanding = new watson.NaturalLanguageUnderstandingV1(config.watsonNLUCredentials);

const replyToUser = {
  type: 'incoming',
  name: 'reply-to-user',
  controller: (bot, update, next) => {
    bot.sendIsTypingMessageTo(update.sender.id, {ignoreMiddleware: true});

    console.log(JSON.stringify(update));

    // Set options object when calling Watson Natural Language Understanding
    const watsonNLUOptions = {
        text: update.message.text,
        features: {
          sentiment: {},
          emotion: {}
        }
      };


    watsonNaturalLanguageUnderstanding.analyze(watsonNLUOptions, (err, watsonNLUResponse) => {
      if (err) {
        console.log('Error occurred: ' + err); // An error occurred when invoking natural language understanding
      } else {
        // Updating the context with sentiment and emotion
        update.session.context.sentiment = watsonNLUResponse.sentiment;
        update.session.context.emotion = watsonNLUResponse.emotion;

        // Use NLU enriched context in call to Watson Conversation
        const messageForWatsonConversation = {
            context: update.session.context,
            workspace_id: process.env.WATSON_WORKSPACE_ID,
            input: {
                text: update.message.text,
            }
        };

        // Calling Watson Conversation with enriched message object
        watsonConversation.message(messageForWatsonConversation, (err, watsonUpdate) => {
            watsonConversationStorageMiddleware.updateSession(update.sender.id, watsonUpdate);
            const watsontext = watsonUpdate.output.text;
            bot.sendTextCascadeTo(watsontext, update.sender.id);
        });
      }
    });

    next();
  }
};

module.exports = {
  replyToUser
}
