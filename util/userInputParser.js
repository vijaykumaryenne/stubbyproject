"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();

module.exports = {

    metadata: () => ({
        "name": "UserInputParser",
        "properties": {
            "variable": { "type":"string", "required":true }
        },
        "supportedActions": []
    }),

    invoke: (conversation, done) => {
        // Parse a number out of the incoming message
        var text = conversation.text();

        if(!text){
          conversation.reply("User input is null");
          conversation.transition('fail');
          done();
          return;
        }
        
        conversation.variable(conversation.properties().variable,text); 
        conversation.keepTurn(true);
        conversation.transition("success");
        done();
    }
};
