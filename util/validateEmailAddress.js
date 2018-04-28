"use strict";

module.exports = {

        metadata: () => (
        {
            "name": "ValidateEmailAddress",
            "properties": {
                "email": { "type": "string", "required": true }
            },
            "supportedActions": ["valid","invalid"]
        }
    ),

    invoke: (conversation, done) => {
        
        var size = conversation.properties().email;
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var isValid = re.test(String(email).toLowerCase());

        switch(isValid){
          case true:
              conversation.transition("valid");
              break;
          default:
              conversation.transition("invalid");  
        }      
        done();
    }
};
