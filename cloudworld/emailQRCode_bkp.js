"use strict"
var log4js = require('log4js');
var logger = log4js.getLogger();

var express = require('express');
var connect = express();
const nodemailer = require('nodemailer');
var QRCode = require('qrcode');

module.exports = {

    metadata: () => ({
        "name": "EmailQRCode",
        "properties": {
          "email": { "type": "string", "required": true},
          "username": { "type": "string", "required": true},
          "successPrompt": { "type": "string", "required": false}
        },
        "supportedActions": ["success","fail"]
    }),

    invoke: (conversation, done) => {

        var successPrompt = "An email has been sent with QR Code attached. Please scan it at reception to claim your gift. Also don't forget to check out infromation about cloud services (SaaS/PaaS)";

        var email = conversation.properties().email;
        var userName  = conversation.properties().username;

         //Use name for personalised email
          // call SendEmail service
     //   callQRCodeEmailService(email, name, function(err, responseError){
 

        var opts = {
            errorCorrectionLevel: 'H',
            type: 'image/jpeg',
            rendererOpts: {
              quality: 0.3
            }
          }

          nodemailer.createTestAccount((err, account) => {
            if (err) {
                console.error('Failed to create a testing account');
                console.error(err);
                return process.exit(1);
            }
             //Push the Order to Sales Cloud
             var giftName = "Stubby Holder";
             var type = "Gift";
             var channel = "ShipToAddress";
             var reference = "4 Julius Avenue,North Ryde";
             var quantity = "1";
             var contactEmail = email;
             var oracleContact = "vijaykumar.yenne@oracle.com";
             var contactName = userName;
             var contactMobile = "123456789";
             var contactAddress = "4 Julius Avenue";
             var contactNotes = "Oracle World";
 
             var body = {
                 "Order":
                   {
                     "Name": giftName,
                     "Type": type,
                     "Channel": channel,
                     "Reference": reference,
                     "Quantity": parseInt(quantity),
                     "ContactName": contactName,
                     "ContactMobile": contactMobile,
                     "ContactEmail": contactEmail,
                     "ContactAddress": contactAddress,
                     "ContactNotes" : contactNotes,
                     "OracleContact": oracleContact
                 }
               };
              
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

            QRCode.toDataURL(email, opts,function (err, url) {
                if (err) console.log('error: ' + err)
                console.log(url);
             
        
            // Message object
            let message1 = {
                // Comma separated list of recipients
                to: email,
        
                // Subject of the message
                subject: 'Claim your gift from the Oracle World',        
              
        
                // HTML body
                html    : "<!DOCTYPE html/><html><head><title>node-qrcode</title></head><body><p>Hi "+userName+", <br><br>Please collect your Stubbie Holder from the Chatbot Gift Desk next to the Digital Social Wall which is located at the far end of the Innovation Showcase. You will need to scan this QR Code to receive this gift </p><img src ='"+url + "'</img> <br> Regards, <br> Oracle Team</body></html>", // html body
                // An array of attachments
                attachments: [
                    // String attachment
                    // Binary Buffer attachment
                    {
                        path: url,        
                        cid: 'note@example.com' // should be as unique as possible
                    }
        
                ]
            };
        
            transporter1.sendMail(message1, (error, info) => {
                if (error) {
                    console.log('Error occurred');
                    console.log(error.message);
                    return process.exit(1);
                }
        
                console.log('Message sent successfully!');
                console.log(nodemailer.getTestMessageUrl(info));
                conversation.reply("We have placed your order. Your Order # is ");
                conversation.reply(successPrompt);
                
                conversation.transition();
                done();
                // only needed when using pooled connections
        
            });
        });   
        });
     }
}
