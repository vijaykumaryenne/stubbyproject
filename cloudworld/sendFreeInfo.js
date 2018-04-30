"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();
var request = require('request');
var express = require('express');
var connect = express();
const nodemailer = require('nodemailer');
var QRCode = require('qrcode');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const OAuth2Client = google.auth.OAuth2;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = './credentials.json';
var emailIn;
var topicIn;
var firstName;
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
        case "HCM":
          topic = "HCM";
          break;  
        case "ERP":
          topic = "ERP";
          break; 
        case "Infrastructure":
          topic = "Infrastructure";
          break; 
        case "OMC":
          topic = "OMC";
          break; 
        case "Ravello":
          topic = "Ravello";
          break; 
        case "Cloud Security Broker":
          topic = "CASB";          
          break;         
        case "Identity Cloud":
          topic = "IDCS";
          break;   
        case "Blockchain":
          topic = "blockchain";
          break;
        default:
          topic = conversation.properties().topic;
      }
      emailIn = email;
      topicIn = topic;
      firstName = userName;

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
      var imageUrlView = "<a href='https://ibb.co/juR9UH'><img src='https://preview.ibb.co/cacG9H/OCW_Banner.jpg' alt='OCW_Banner' border='0'></a>";
      var header = "<!DOCTYPE html/><html><head><title>node-qrcode</title></head><body><p>Hi "+userName + ",<br> <br>";
      var address = "<span style='font-size:10.0pt; line-height:107%;font-family:'Verdana',sans-serif;color:#666666;mso-fareast-language: EN-AU' lang='EN-AU'><br> Oracle Australia | 4 Julius Avenue, North Ryde | Sydney NSW     2113</span>";
      var freeTrial = "<span lang='EN-AU'> <a href='https://cloud.oracle.com/en_US/tryit'><span  style='font-size:10.0pt;line-height:107%;font-family:'Verdana',sans-serif;color:black' lang='EN-US'>Get FREE Cloud Credits and  try Oracle IaaS and PaaS</span></a></span>";
      var footer = "<br><b> Regards,</b> <br> <b> <span style='color:red'>Oracle Team </span></b><br>"+address+"<br>" + freeTrial+"<br> <br>" +imageUrlView+"</body></html>";
      //Block Chain Template
      if(topic == "blockchain"){
        htmlTemplate =  header +
                          "Thank you for your interest in Oracle Blockchain. The links and information that you requested are below.  </p><br>  <ul> <li> Integrated Business Networks using Blockchain Whitepaper <a href='https://bit.ly/blockchainwp'> here</a> </li><li> Learn more about Blockchain <a href='https://bit.ly/blockcvideos'> here</a></li></ul>"
                        +footer, // html body
        subject = "Information about Blockchain"
      };

      //Integration Cloud
      if(topic == "integration"){
        htmlTemplate =  header +
                            "Thank you for your interest in Oracle Integration Cloud. The links and information that you requested are below: </p><br>  <ul> <li> Learn more about Integration Cloud on our <a href='http://bit.ly/oicsolutions'> Solutions Page</a> </li><li> See what the experts are saying about our integration strategy by reviewing the latest <a href='http://bit.ly/oicanalysts'> Analyst Report</a></li><li>Download the Whitepaper <a href='http://bit.ly/oicwhitepaper'>Five Ways to Simplify Cloud Integration </a> </li><li>See how other customers have benefited from Integration Cloud <a href ='http://bit.ly/oicsuccess' >Success Stories</a></li><li>Hear more about Integration Cloud on <a href='https://youtu.be/NxaZYMuRMGo'>YouTube</a> </li></ul>"
                        + footer, // html body
        subject = "Information about Integration Cloud"
      };

      // chatbot
      if(topic == "chatbot"){
        htmlTemplate =  header + 
                          "Thank you for your interest in Oracle Mobile and Chatbots. The links and information that you requested are below.  </p><br>  <ul> <li>  Learn more about Mobile or Chatbots on our  <a href='http://bit.ly/oraclebots'> Mobile Solutions Page</a> </li><li> See what the experts are saying about our mobile strategy by reviewing the latest  <a href='http://bit.ly/oraclebotsmq'> Analyst Report</a></li><li>Download the Whitepaper <a href='http://bit.ly/oraclebotswp'>New Imperatives for Business Mobile Application Strategies </a> </li><li>See how other customers have benefited from Chatbots <a href='http://bit.ly/oraclebotssuccess'>Success Stories </a> </li><li>Hear more about Chatbots on <a href='https://bit.ly/2ygvNGF' >YouTube</a> </li></ul>"
                          + footer, // html body
        subject = "Information about Mobile & Chatbots"
      };


      //CX
      if(topic == "CX"){
        htmlTemplate =  header +
                             "Thank you for your interest in Oracle Customer Experience Cloud. The links and information that you requested are below </p><br>  <ul> <li> Learn more about CX  - <a href='https://bit.ly/cxmore'> here</a> </li><li> See what the experts are saying about our customer experience strategy by reviewing the latest Analyst Report  <a href='https://bit.ly/cxarep'> here</a></li><li>Five Data Driven Tech Trends Shaping Customer Experience Whitepaper <a href='https://bit.ly/cxwhp'>here </a> </li><li>See how other customers have benefited from Customer Experience Cloud <a href ='https://bit.ly/cxref' >Success Stories</a></li><li>	Hear more about Oracle CX on  <a href='https://bit.ly/cxvideos'>YouTube</a> </li></ul>"
                        + footer, // html body
        subject = "Information about CX Cloud"
      };

      //HCM
      if(topic == "HCM"){
        htmlTemplate =  header + "Thank you for your interest in Oracle HCM Cloud. The links and information that you requested are below: </p><br>  <ul> <li> Learn more about HCM Cloud <a href='https://bit.ly/hcmmore'> here</a> </li><li> Gartner, Magic Quadrant for Cloud HCM Suites for Midmarket and Large Enterprises <a href ='https://bit.ly/hcmarep2'> here</a></li><li>Human Capital Management Cloud Using Analytics and Reports Whitepaper <a href='https://bit.ly/hcmwp'>here </a> </li><li>Listen how Annika Lindholm, Global HR Owner, Skanska, a leading construction group, discusses how they leveraged the power of HCM Cloud <a href ='https://bit.ly/hcmstories' >here</a></li><li>Listen to Oracle SVP, HCM Product Marketing, Emily He discuss the biggest focus areas for HR in the year ahead YouTube  <a href='https://bit.ly/hcmvideos'>here</a> </li></ul>"
                        + footer, // html body
        subject = "Information about HCM Cloud"
      };

      //HCM
      if(topic == "ERP"){
        htmlTemplate =  header + "Thank you for your interest in Oracle ERP Cloud. The links and information that you requested are below: </p><br>  <ul> <li> Learn more about ERP Cloud  on our - <a href='http://bit.ly/oracleerp'> Solutions Page</a> </li><li> See what the experts are saying about our ERP strategy by reviewing the latest - <a href='http://bit.ly/oracleerpmq'> Analyst Report</a></li><li>	Download the Whitepaper :<a href='http://bit.ly/oracleerpwp'>5 Benefits of Having ERP and HCM in a Single Cloud Platform  </a> </li><li>See how other customers have benefited from ERP Cloud - <a href ='http://bit.ly/oracleerpstory' >Success Stories </a></li><li>Watch our demos on <a href='http://bit.ly/oracleerpvideos'>YouTube</a> </li></ul>"
                        + footer, // html body
        subject = "Information about ERP Cloud"
      };

      //IaaS
      if(topic == "Infrastructure"){
        var extraInfo ="<br><p>IaaC & Terraforming Oracle IaaS Cloud </p><br><p>The Oracle Classic IaaS and Platform Services Manager Control Planes are front-ended by comprehensive RESTful API endpoints. These RESTful endpoints are the foundational enablers for cloud automation and orchestration using tools such as Hashicorp Terraform. Check out the links below in automating the Oracle IaaS Cloud:</p><ul> <li>Getting started with Terraform on OCI Classic IaaS: <a href='https://redthunder.blog/2018/02/20/teaching-how-to-use-terraform-to-manage-oracle-cloud-infrastructure-as-code/'>Using Terraform to manage Oracle IaaS</a>  </li><li>  Official Terraform for OCI Classic IaaS documentation: <a href='https://www.terraform.io/docs/providers/opc/'> Oracle Public Cloud Automation with Terraform</a> </li> <li> Check out <a href='https://blogs.oracle.com/developers/announcing-oracle-cloud-infrastructure-modules-for-the-terraform-modules-registry'> Terraform Modules for OCI Classic IaaS</a> </li> <li> Provision Oracle Cloud Platform PaaS Services using Terraform < a href='https://blogs.oracle.com/developers/announcing-terraform-support-for-oracle-cloud-platform-services'>here </a></li> <li> Learn more about the OCI Classic Rest API <a href ='https://docs.oracle.com/en/cloud/iaas/compute-iaas-cloud/stcsa/toc.htm'>here <a/></li></ul>";
        htmlTemplate =  header + "Thank you for your interest in Oracle Cloud Infrastructure. The links and information that you requested are below:  </p><br>  <ul> <li> Learn how businesses like yours can begin to optimize for today and plan for tomorrow with Cloud-Ready IT Infrastructure - The Oracle Infrastructure blog <a href='https://blogs.oracle.com/infrastructure/'> here</a> </li><li> Customer Success Stories -<a href='https://cloud.oracle.com/en_US/iaas/customers'> here</a></li></ul>"+extraInfo +footer, // html body
        subject = "Information about Oracle Cloud Infrastructure"
      };

       //IaaS
       if(topic == "OMC"){
        htmlTemplate =  header + "Thank you for your interest in Oracle Management Cloud. The links and information that you requested are below: </p><br>  <p> Oracle Management Cloud (OMC) is a suite of next-generation integrated monitoring, management, and analytics cloud services that leverage machine learning and big data techniques against the full breadth of the operational data set. OMC's Unified Platform helps customers improve IT stability, prevent application outages, increase DevOps agility and harden security across their entire application and infrastructure portfolio.</p><br> <p>Check out Oracle Management Cloud: Intelligent, Unified Platform <a href='https://cloud.oracle.com/en_US/management'> here</a></p></li></ul>"+footer, // html body
        subject = "Information about Oracle Management Cloud"
      };


      //Security CASB

      if(topic == "CASB"){
        htmlTemplate =  header + "Thank you for your interest in Oracle's Cloud Access Security Broker. The links and information that you requested are below.  </p><br>  <ul> <li> Learn more about security in the cloud with our <a href='http://bit.ly/securityoverview'> Security Solutions Overview</a> </li><li> Read the <a href='http://bit.ly/casbbook'> eBook </a>on using CASB to help automate your Cloud Security</li><li>Understand how CASB can help secure your business from internal and external threats :<a href='http://bit.ly/securitywp'>Whitepapers  </a> </li><li>Securing Oracle Cloud Applications with Oracle CASB Cloud Service <a href ='http://bit.ly/casbdatasheet' >data sheet</a></li><li>The Importance of User Behaviour Analytics for Cloud Service Security <a href='http://bit.ly/casbanalytics'>user behaviour</a> </li><li> Learn how to set up CASB monitoring of IaaS with a complete <a href='http://bit.ly/casbvideos'>video series </a></li></ul> "
                        + footer, // html body
        subject = "Information about Oracle Cloud Access Security Broker"
      };

      //Security Identity / IDCS

      if(topic == "IDCS"){
        htmlTemplate =  header + "Thank you for your interest in Oracle Identity Cloud Service. The links and information that you requested are below.  </p><br>  <ul> <li> Learn more about security in the cloud with our <a href='http://bit.ly/securityoverview'> Security Solutions Overview</a> </li><li> Explore the <a href='http://bit.ly/idcsreasons'> Top 5 Reasons </a>to Move Security to the Cloud </li><li>Download the <a href='http://bit.ly/idcsoverview'>Business Overview  </a> </li><li>Learn more about the architecture in a <a href ='http://bit.ly/2JycwlF' >Technical deep-dive</a></li><li>Download the code samples from  <a href='https://github.com/oracle/idm-samples'>GitHub</a> and get developing!</li></li></ul> "
                        + footer, // html body
        subject = "Information about Oracle Identity Cloud Service"
      };

       //Ravello
       var ravelloLinks = "<li><a href ='http://bit.ly/ravello1'>	How to move VMware virtualized E-Business Suite to OCI with Ravello </a></li><li><a href ='http://bit.ly/ravello2' >	Economic value of running E-Business Suite on Ravello </a></li><li><a href ='http://bit.ly/ravello3' >	How to move VMware virtualized Peoplesoft to OCI with Ravello </a></li><li><a href ='http://bit.ly/ravello4' >	Economic value of running Peoplesoft on Ravello </a></li><li><a href ='http://bit.ly/ravello5' >	How to move VMware virtualized JD Edwards to OCI with Ravello</a></li><li><a href ='http://bit.ly/ravello6' >	Economic value of running JD Edwards on Ravello</a></li><li><a href ='http://bit.ly/ravello7' >	How to move VMware virtualized Siebel CRM to OCI with Ravello </a></li><li><a href ='http://bit.ly/ravello8' >	Economic value of running Siebel CRM on Ravello</a></li>"

       if(topic == "Ravello"){
        htmlTemplate =  header + "Thank you for your interest in the Ravello platform! Here are some links and information that will help you understand the full cloud capability of Ravello. </p><br> <p>Ravello is a cloud service that enables enterprises to run their VMware and KVM workloads, with datacenter-like (L2) networking, ‘as-is’ on the public cloud without any modifications. With Ravello, enterprises don’t need to convert their VMs or change their networking configuration to run their existing apps on the public cloud. </p><br> <ul> <li> <a href='https://cloud.oracle.com/en_US/ravello/faq'> Frequently Asked Questions here</a> </li><li> Ravello white papers can be found<a href='https://cloud.oracle.com/en_US/ravello/whitepapers'> here</a></li><li>	Videos demonstrating and explaining the Ravello platform can be found<a href='https://cloud.oracle.com/en_US/ravello/videos'>here  </a> </li><li>Lift and Shift Oracle Applications to Ravello: <br> <ul>"+ravelloLinks+"</ul></li></ul>"
                        + footer, // html body
        subject = "Information about Ravello"
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
        // Code to save the interests to Google Spreadsheet

          // Load client secrets from a local file.
          fs.readFile('client_secret.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Sheets API.
            authorize(JSON.parse(content), addInfo);
          });


    });
  
});

}

function checkResponseError(responseBody){
  console.info(JSON.stringify(responseBody));
  return (responseBody.Error ? responseBody.Error : null)
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}
/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Add the names of attendees conversing with the bot requesting for Cloud information:
 * @see https://docs.google.com/spreadsheets/d/1VRUcLVykfPIsuD-AgwWGky8_EqhpI-WWVoUFBKWEPAM/edit#
 * @param {OAuth2Client} auth The authenticated Google OAuth client.
 */
function addInfo(auth) {
  var date = new Date();
  console.log("date is"+ date);
  const sheets = google.sheets({version: 'v4', auth})  
  sheets.spreadsheets.values.append({
    auth: auth,
    spreadsheetId: '1VRUcLVykfPIsuD-AgwWGky8_EqhpI-WWVoUFBKWEPAM',
    range: 'Sheet1!A2:D', //Change Sheet1 if your worksheet's name is something else
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [ [emailIn, topicIn,firstName,date] ]
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




 
 
    

 

