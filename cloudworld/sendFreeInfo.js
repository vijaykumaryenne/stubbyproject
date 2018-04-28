"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();
var request = require('request');
var express = require('express');
var connect = express();
const nodemailer = require('nodemailer');
var QRCode = require('qrcode');
let google = require('googleapis');
let authentication = require("./authentication");

module.exports = {

    metadata: () => ({
        "name": "SendFreeInfo",
        "properties": {
          "email": { "type": "string", "required": true},
          "topic": { "type": "string", "required": true},
          "username": { "type": "string", "required": true},
          "successPrompt": { "type": "string", "required": false}
        },
        "supportedActions": ["success","fail"]
    }),

    invoke: (conversation, done) => {

      var successPrompt;

      if(!conversation.properties().email || conversation.properties().email.length === 0 ){
          conversation.reply("email and topic are mandatory");
          conversation.transition('fail');
          done();
          return;
      }

      if(!conversation.properties().topic || conversation.properties().topic.length === 0 ){
          conversation.reply("email and topic are mandatory")
          conversation.transition('fail');
          done();
          return;
      }

      if(!conversation.properties().successPrompt || conversation.properties().successPrompt.length === 0 ){
          successPrompt = "Email Sent! We appreciate your interest in our Cloud, I'm here to help if you need me again!";
      } else {
          successPrompt = conversation.properties().successPrompt;
      }

      var email = conversation.properties().email;
      var userName  = conversation.properties().username;
      var topic; 

      switch(conversation.properties().topic){
        case "Integration Cloud": 
          topic = "integration";
          break;
        case "Mobile & Chatbots":
          topic = "chatbot";
          break;
        case "Customer Experience":
          topic = "CX";
          break;
        case "Blockchain":
          topic = "blockchain";
          break;
        default:
          topic = conversation.properties().topic;
      }


      // call SendEmail service
      callSendEmailService(email,userName, topic, function(err, responseError){

        if(err){
            conversation.reply("We could not send out the email. Sorry for the inconvenience, please try again later");  
            conversation.transition();
            done();
            return;
          }

        if (responseError) {
          conversation.reply(responseError);
        }else{
          conversation.reply(successPrompt);
          appendData(auth);
        }
        conversation.transition();
        done();
        return;
        

      });
    }
}

function callSendEmailService(email,userName, topic, callback){

  nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account');
        console.error(err);
        return process.exit(1);
    }
    console.log('Credentials obtained, sending message...');

    // NB! Store the account object values somewhere if you want
    // to re-use the same account for future mail deliveries

    // Create a SMTP transporter object
    let transporter1 = nodemailer.createTransport(
        {
            host: 'stbeehive.oracle.com',
            port: '465',
            secure: true,
            auth: {
                user: 'SC-SOLUTIONS_AU@ORACLE.COM',
                pass: 'CBTeam%18'
            },
            logger: false,
            debug: false // include SMTP traffic in the logs
        },
        {
            // default message fields

            // sender info
            from: 'noreply@oracle.com',
            headers: {
                'X-Laziness-level': 1000 // just an example header, no need to use this
            }
        }
    );
    var htmlTemplate ;
    var subject;
    var url ="https://documents-gse00013596.documents.us2.oraclecloud.com/documents/link/LD6AB601E794EECF78EF446B2770F05748E1E8D22F9C/file/D9577E6C4AF885D0E68D5DCC2770F05748E1E8D22F9C/_OCW_Banner.jpg";
    if(topic == "blockchain"){
      htmlTemplate =  "<!DOCTYPE html/><html><head><title>node-qrcode</title></head><body><p>Hi "+userName+", <br><br>Thank you for your interest in Oracle Blockchain. The links and information that you requested are below:  </p><br>  <ul> <li> Integrated Business Networks using Blockchain Whitepaper - <a href='https://bit.ly/blockchainwp'> here</a> </li><li> Learn more about Blockchain -<a href='https://bit.ly/blockcvideos'> here</a></li></ul><br>Regards, <br> Oracle Team <br> <img src ='"+url + "'</img> </body></html>", // html body
      subject = "Information about Blockchain"
    };

    // Message object
    let message1 = {
        // Comma separated list of recipients
        to: email,


        // Subject of the message
        subject: subject,              

        // HTML body
        html    : htmlTemplate, // html body
        // An array of attachments
     //   attachments: [
            // String attachment
            // Binary Buffer attachment
       //     {
       //         path: url,        
         //       cid: 'note@example.com' // should be as unique as possible
           // }

//]
    };

    transporter1.sendMail(message1, (error, info) => {
         
        if(error){
          callback(error);
          return;
        }
        callback(null, checkResponseError(info));
        console.log('Message sent successfully!');        
        // only needed when using pooled connections
    });
  
});

}

function checkResponseError(responseBody){
  console.info(JSON.stringify(responseBody));
  return (responseBody.Error ? responseBody.Error : null)
}


function appendData(auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.append({
    auth: auth,
    spreadsheetId: '1VRUcLVykfPIsuD-AgwWGky8_EqhpI-WWVoUFBKWEPAM',
    range: 'Sheet1!A2:B', //Change Sheet1 if your worksheet's name is something else
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [ ["Blockchain", "vijaykumar.yenne@oracle.com", "Time Stamp1"], ["PaaS", "rachel@oracle.com", "TimeStamp2"] ]
    }
  }, (err, response) => {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    } else {
        console.log("Appended");
    }
  });
}

authentication.authenticate().then((auth)=>{
    appendData(auth);
});




 
 
    

 

