// controllers/otpController.js

const AWS = require('../config/aws');

async function sendOtpViaSns(phoneNumber, otp) {
  const sns = new AWS.SNS();
  const params = {
    Message: `Hello ji. OTP batao ji.. batao na ji : ${otp}`,
    PhoneNumber: phoneNumber
  };

  try {
    const data = await sns.publish(params).promise();
    console.log('OTP sent via Amazon SNS:', data.MessageId);
    return data.MessageId;
  } catch (error) {
    console.error('Error sending OTP via Amazon SNS:', error);
    throw error;
  }
}

module.exports = { sendOtpViaSns };
