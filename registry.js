'use strict';
module.exports = {
  components: {
  
    
    // Cloud World Bot
    
      'SendFreeInfo': require('./cloudworld/sendFreeInfo'),
      'ValidateEmailAddress': require('./util/validateEmailAddress'),
      'UserInputParser': require('./util/userInputParser'),
      'EmailQRCode': require('./cloudworld/emailQRCode')
}
};
